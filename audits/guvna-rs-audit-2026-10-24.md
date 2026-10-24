# guvna-rs 全量代码审计报告（2026-10-24）

审计对象：https://github.com/chuyua/guvna-rs

本文件仅托管该项目的审计报告和复现源码，审计发现不针对本托管仓库。

> 多合一审计跟踪：以下 8 项均在固定提交上复现。资源问题需要有效客户端凭据，不属于未认证利用。P1/P2 为本次审计建议优先级。

# 审计基线与范围

审计基线：`chuyua/guvna-rs`，默认分支 `main`，提交 `6018220c9573d9b6908d73642bc79f7d824ac70e`。审计日期：2026-10-24。

本次覆盖全部 22 个 Rust 源文件、两套原有集成测试、Cargo 清单与锁文件、CI/发布工作流、质量门禁脚本和相关设计文档。重点审查认证与资源准入、路由与 Auto、密钥轮转/隔离、熔断、Chat/Embeddings 响应校验、Chat SSE、SSE 聚合、Responses 转换、SQLite 遥测、本地控制 socket 和离线路由链管理。本 Issue 汇总本地模拟上游验证的结果；未修改业务实现，未访问真实模型供应商。

## 结论

确认 8 项缺陷：3 项 P1、5 项 P2。未发现已证实的 P0、未认证密钥泄漏或远程代码执行。这里的“未发现”仅针对本次代码与测试，不能视为不存在其他问题的保证。

| 编号 | 级别 | 问题 | 主要位置 |
|---|---|---|---|
| F01 | P1 | 截断的函数调用被发送为 completed 输出项 | `src/responses_sse.rs:685` |
| F02 | P1 | 8 槽内存门禁在请求树释放前失效 | `src/dispatch.rs:193`、`src/responses.rs:37` |
| F03 | P1 | 非流式响应在交付结束前释放准入许可 | `src/dispatch.rs:755` |
| F04 | P2 | Responses 专用校验位于 failover 提交之后 | `src/responses.rs:400`、`src/dispatch.rs:744` |
| F05 | P2 | 上游 4xx 错误体读取超出全链 deadline | `src/dispatch.rs:827` |
| F06 | P2 | SSE 聚合拒绝完整且可被 Chat 接受的 EOF 终止 | `src/chat_aggregate.rs:320` |
| F07 | P2 | SSE 聚合把临时 usage + 最终 usage trailer 判作损坏 | `src/chat_aggregate.rs:145` |
| F08 | P2 | 超限损坏 chains.yaml 无法通过 recover 恢复 | `src/chain_store.rs:357` |

P1 表示应优先修复的资源可用性或输出完整性问题；P2 表示具体条件下的功能、兼容性或运维恢复故障。资源问题需要有效客户端凭据，或具有相应配置的上游响应，不属于未认证利用。

## F01 · P1 · 截断函数调用仍带 completed 状态

位置：[responses_sse.rs:685](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/responses_sse.rs#L685)。

触发条件：`POST /v1/responses`、`stream:true`；上游先发出函数参数片段，例如 `{"city":`，随后以 `finish_reason:"length"` 或 `"content_filter"` 结束。

`complete()` 正确计算了整体 `status="incomplete"`，但 `response.output_item.done` 中的 function_call 状态硬编码为 `completed`。复现输出：

```json
{"type":"response.output_item.done","item":{"type":"function_call","arguments":"{\"city\":","status":"completed"}}
```

之后的 `response.incomplete` 及其嵌套输出又使用 incomplete，造成同一工具项的状态不一致。消费 `output_item.done` 的客户端可能提前调度不完整工具调用；是否实际执行取决于客户端。本问题直接违反 `docs/audit/MIGRATION_GATES.md` 中 G05：“Incomplete JSON arguments must never have completed status.”

建议：根据完整性设置工具项状态；截断调用应保持 incomplete，不能因发送 `.done` 事件就标为完成。回归测试应同时检查增量输出项和最终 response 中的状态，并覆盖 length、content_filter、有效及无效参数。

复现：`truncated_tool_is_emitted_as_completed_item`。

## F02 · P1 · 内存门禁不覆盖仍然存活的请求树和候选序列化

位置：[dispatch.rs:193](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/dispatch.rs#L193)、[responses.rs:37](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/responses.rs#L37)。

`authenticated_body()` 获取 8 槽 payload semaphore，但解析出 `serde_json::Value` 后立即释放许可。完整的请求树和序列化后的 `payload_json` 仍在整个上游等待/重试过程中存活。于是新请求可以不断绕过这 8 槽，直到另一个 128 请求上限。Responses 还在释放许可后做输入转换、序列化，再在 dispatch 中重新解析。

已验证：9 个携带 1 MiB 数据的请求同时进入挂起的模拟上游，全部保留解析后的 payload；8 槽并没有限制这些存活数据。大量短数字或小对象还会使 JSON 树内存远大于 wire bytes，因此 8 MiB 传输大小限制不能代替解析内存预算。

实际 Release 进程中，12 个每个仅 524,327 字节的本地请求全部进入上游，RSS 从 5.14 MiB 升至 207.92 MiB；`active_requests=12`。实测原始 JSON 附在下方。测试仅使用本地假密钥。

影响：有效客户端在慢上游条件下可积累大量请求内存，低内存 VPS 存在 OOM 风险；README 所述候选序列化内存门禁也未实际实现。

建议：给仍然存活的请求树和序列化缓冲区设置覆盖真实生命周期的字节/节点内存配额，数据销毁后再释放；不能只限制 wire bytes。实现时需兼顾 #91 的并发目标，避免直接把所有等待上游的请求重新限制为 8 个。非流式响应另设全局预算。

复现：`nine_requests_keep_parsed_payloads_beyond_eight_payload_slots`、`memory_repro.py` 的 payload 场景。

## F03 · P1 · 慢读客户端保留 JSON 响应时已经不占准入额度

位置：[dispatch.rs:755](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/dispatch.rs#L755)。

非流式成功分支把 `Value` 序列化为完整响应 body，随后返回 handler；局部变量中的 admission permit 随即释放。与 Chat SSE 的 `ChatStreamState` 不同，JSON 响应 body 没有持有许可或其他响应内存配额。

已验证：通过公开 Router 连续取得并保留 130 个未消费的 JSON 响应，所有请求均成功，`active_requests=0`。真实 TCP 慢读实验中，12 个客户端只读取响应头，停止读取各约 8 MiB 的正文。RSS 从 5.24 MiB 升至 169.18 MiB，但 `active_requests=0`。原始数据附在下方。

影响：128 请求限制无法限制尚未交付的大 JSON 响应数量。有效客户端可以持续创建慢读连接，让响应缓冲积累；上游每响应 32 MiB 的上限不能形成全局内存上限。

建议：为非流式响应添加随 body EOF/drop 释放的全局内存额度或 admission guard，并限制下游无进展的写入时间。需要用真实 TCP 背压回归，不能仅统计 handler 返回前的并发。

复现：`buffered_response_bodies_outlive_all_admission_permits`、`memory_repro.py` 的 slow-reader 场景。

## F04 · P2 · Responses 在无法再 failover 时才验证所需响应字段

位置：[dispatch.rs:744](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/dispatch.rs#L744)、[responses.rs:400](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/responses.rs#L400)。

共享 Chat 校验接受了 Responses 无法翻译的结果，例如缺失 `id`、不一致的 token usage。dispatcher 先记录密钥成功、熔断成功、Auto 成功和 `upstream_success`，并结束候选遍历；Responses 在其后读取 body 并返回 502。

复现：首候选返回 choices 有效但缺少 id 的 200；备用候选配置健康。客户端得到 `502 invalid_chat_id`；备用调用次数为 0，`upstream_success=1`。

影响：配置了备用服务仍无法恢复；失败调用被记录为健康成功，影响监控和健康路由。同样的缺口还存在于 Responses SSE 的专用转换校验发生在 Chat preflight 提交之后，修复时应一并检查。

建议：向唯一共享 dispatcher 传递端点所需的校验/转换要求，在提交成功和交出首个客户端事件前执行。不必再实现一套候选遍历。Responses 应明确固定单 choice，避免链默认 `n` 与其协议约束冲突。

复现：`responses_validation_runs_after_fallback_commit`。

## F05 · P2 · 全链 deadline 没有覆盖 4xx 错误体

位置：[dispatch.rs:827](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/dispatch.rs#L827)。

4xx 的 `bounded_error_json()` 使用独立的 2 秒 timeout，没有与剩余 `walk_deadline` 取最小值。若上游已发出错误响应头，却缓慢交付 body，整个请求会在 walk 过期后继续占用资源。

复现：`timeout.walk:100ms`，上游立即返回 400 响应头，正文延迟 400ms。结果约 403ms 后才返回 504。原配置的 100ms deadline 被跨越；若正文一直不完成，会接近额外 2 秒。

建议：该分支使用 `timeout_at(min(walk_deadline, now+2s), ...)`，在 deadline 到达时立即返回统一 walk timeout。

复现：`upstream_4xx_error_body_escapes_walk_deadline`。

## F06 · P2 · SSE 聚合拒绝已经正常结束的 EOF

位置：[chat_aggregate.rs:320](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/chat_aggregate.rs#L320)。

ChatSse 已实现 `finalize_on_eof()`：当所有 choices 有有效 finish_reason、没有半帧时，可以合成 `[DONE]`。实时 Chat 路径调用它；stream_only 聚合路径却在所有 EOF 上直接返回 InvalidStream。

复现：同一条完整 SSE 有 `finish_reason:"stop"`，没有显式 `[DONE]`。实时 Chat 成功并输出合成 `[DONE]`；非流式聚合将其判坏，调用备用服务，丢弃首候选结果。

影响：已被项目实时 Chat 接受的供应商响应在非流式模式下失败，造成重复推理/额外计费；没有健康备用时返回 502。缺少 finish_reason 或含残缺帧的 EOF 仍然必须拒绝。

建议：聚合 EOF 时复用 ChatSse 的完整性判断，只有能安全 finalize 的 EOF 才允许生成最终 JSON。

复现：`aggregate_rejects_eof_accepted_by_live_chat`。

## F07 · P2 · 聚合 usage 规则与共享 Chat parser 不一致

位置：[chat_aggregate.rs:145](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/chat_aggregate.rs#L145)。

共享 Chat parser 以及 Responses SSE 的代码明确允许普通 choice 事件携带临时 usage，随后用唯一 empty-choices trailer 提供最终 accounting。聚合器却把第一次非 null usage 保存后，在任意后续非 null usage 上报错。

复现：最后一个 content choice 含合法 usage，随后 empty-choices trailer 含合法最终 usage，最后 `[DONE]`。聚合器丢弃正常结果并调用备用服务。

影响：兼容上游发生不必要的 failover、额外费用或 502；这不是识别重复 authoritative trailer，而是误拒绝项目本身认可的临时+最终 usage 模式。

建议：区分 provisional usage 和 authoritative trailer，保持与 ChatSse 一致的单 trailer 规则；最终保存权威计数，并正确计算替换后的输出内存预算。

复现：`aggregate_rejects_usage_choice_plus_authoritative_trailer`。

## F08 · P2 · 超限损坏文件阻断显式恢复命令

位置：[chain_store.rs:357](https://github.com/chuyua/guvna-rs/blob/6018220c9573d9b6908d73642bc79f7d824ac70e/src/chain_store.rs#L357)。

`Recover` 在验证有效备份之后，仍通过普通 `read_limited()` 读取损坏 live 文件。文件只要超过 1 MiB，就在保存原件和提交备份前报错。

复现：live `chains.yaml` 为 1 MiB+1 字节损坏文件，`chains.yaml.bak` 是有效 `version:1/chains:[]`。调用 `Recover(None)` 被拒绝，live 保持原状。启动、set/delete 和 recover 均无法恢复服务，必须手工移动文件。

建议：保留对恢复来源的大小和格式校验；对损坏原件使用同目录安全 rename 或有界流式复制保存，避免把损坏文件的可解析性/大小作为恢复前提。保持锁、拒绝 symlink/特殊文件并 fsync。

复现：`oversized_corrupt_live_chain_cannot_be_recovered_from_valid_backup`。


## 与既有 Issue 的关系

检索了当前全部 136 条 issue/PR，没有发现包含本次 8 项复现的未关闭总 Issue。相关历史记录均已关闭，列出便于追踪残留问题，而非把历史缺陷直接视为当前漏洞：

- F02/F03 关联 #82（内存放大）和 #91（payload slots 跨整个 dispatch 限制并发）。本次补充请求树存活和真实下游背压证据；修复需同时满足内存预算与并发目标。
- F06 关联 #124（完整 EOF 的接受语义）。直接 Chat 已可 finalize，聚合分支仍未复用。
- F07 关联 #104、#128（普通内容帧 usage 的兼容性）。本次是聚合器的临时 usage + authoritative trailer 组合。

## 验证结果

- 原有测试：250 项通过（lib 142、main 8、chain_management 11、gateway_integration 89），0 失败。
- `cargo fmt --all -- --check`、`cargo clippy --all-targets --locked -- -D warnings`、`cargo build --release --locked` 均通过。
- 原有 Linux Release 全套质量门禁通过：每波 2000 请求、64 客户端、idle 10 秒；既有门禁未覆盖下方新增场景。
- 8 个独立复现测试通过：这些断言确认当前缺陷行为存在，修复后应改成验证正确行为的回归测试。
- Rust 1.99.1 / Cargo 1.99.1，Linux x86_64；未在 Windows 或真实供应商上执行。RSS 是本次环境实测值。
- `cargo-audit 0.22.2`：Cargo.lock 171 个依赖，已知漏洞 0；另有 `unsafe-libyaml 0.2.11` 停止维护告警 RUSTSEC-2024-0449（经 serde_yaml_ng 引入），不计入上述 8 项缺陷。RustSec 数据库提交 `21d909e4c8bd4e14c7aea58bf980c881a0053ab1`，更新于 2026-10-24。

### Release 真实 HTTP 内存数据

```json
{
  "binary": "/workspace/guvna-rs/target/release/guvna",
  "results": {
    "payload": {
      "wire_bytes_per_request": 524327,
      "upstream_calls": 12,
      "active_requests": 12,
      "rss_before_mib": 5.14453125,
      "rss_held_mib": 207.921875
    },
    "slow-reader": {
      "unread_response_bodies": 12,
      "response_bytes_each": 8388700,
      "active_requests": 0,
      "rss_before_mib": 5.2421875,
      "rss_held_mib": 169.18359375
    }
  }
}
```

### 独立复现运行输出

```text
   Compiling guvna v0.1.0 (/workspace/guvna-rs)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 3.06s
     Running tests/audit_repro.rs (target/debug/deps/audit_repro-d5121d013bbcdf58)

running 8 tests
valid provisional+trailer usage replays backup
test aggregate_rejects_usage_choice_plus_authoritative_trailer ... ok
same complete SSE: live chat accepted; aggregation replayed backup
test aggregate_rejects_eof_accepted_by_live_chat ... ok
130 unconsumed JSON response bodies retained; active_requests=0
test buffered_response_bodies_outlive_all_admission_permits ... ok
valid backup recovery refused: /tmp/.tmp7IdzjD/chains.yaml must be a regular file of at most 1 MiB
test oversized_corrupt_live_chain_cannot_be_recovered_from_valid_backup ... ok
responses result={"error":{"code":"invalid_chat_id","message":"Upstream chat response id is missing","type":"gateway_error"}}, backup calls=0, upstream_success=1
test responses_validation_runs_after_fallback_commit ... ok
incomplete tool output: {"item":{"arguments":"{\"city\":","call_id":"call1","id":"call1","name":"lookup","status":"completed","type":"function_call"},"output_index":0,"sequence_number":5,"type":"response.output_item.done"}
test truncated_tool_is_emitted_as_completed_item ... ok
100ms walk budget returned after 403.177102ms
test upstream_4xx_error_body_escapes_walk_deadline ... ok
9 simultaneous parsed 1 MiB payloads survived the 8-slot memory gate
test nine_requests_keep_parsed_payloads_beyond_eight_payload_slots ... ok

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 2.18s

```

## 可直接执行的复现源码

全部使用本地假密钥与模拟上游。请在隔离的审计 checkout 运行，避免覆盖已有同名文件。

```sh
git checkout 6018220c9573d9b6908d73642bc79f7d824ac70e
# 将下方 Rust 内容保存到 tests/audit_repro.rs
cargo test --locked --test audit_repro -- --nocapture
# 将下方 Python 内容保存到 memory_repro.py
cargo build --release --locked
python3 memory_repro.py target/release/guvna
```

<details>
<summary>tests/audit_repro.rs — 8 项公开接口复现</summary>

```rust
//! Assertions describe observed defects, not the desired fixed behavior.
use axum::{Router, body::{Body, to_bytes}, http::{Request, StatusCode}, routing::post};
use guvna::{config::Config, gateway::{AppState, app_with_state}};
use serde_json::{Value,json};
use std::{collections::HashMap, sync::{Arc, atomic::{AtomicUsize, Ordering}}, time::Duration};
use tower::ServiceExt;

fn completion() -> Value { json!({"id":"test-id","created":1,"model":"m","choices":[{"index":0,"message":{"role":"assistant","content":"ok"},"finish_reason":"stop"}]}) }
async fn serve(body: String, sse: bool) -> (String, Arc<AtomicUsize>) {
 let calls=Arc::new(AtomicUsize::new(0)); let seen=calls.clone();
 let router=Router::new().route("/v1/chat/completions",post(move || {let body=body.clone();let seen=seen.clone();async move {seen.fetch_add(1,Ordering::SeqCst); ([("content-type",if sse {"text/event-stream"} else {"application/json"})],body)}}));
 let listener=tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();let addr=listener.local_addr().unwrap();
 tokio::spawn(async move {axum::serve(listener,router).await.unwrap();});
 (format!("http://{addr}"),calls)
}
fn gateway(first: &str, backup: &str, stream_only: bool) -> (Router,Arc<AppState>) {
 let config: Config=serde_yaml::from_str(&format!("providers:\n  - name: p\n    type: openai\n    base_url: {first}\n    key_env: K\n    stream_only: {stream_only}\n  - name: b\n    type: openai\n    base_url: {backup}\n    key_env: B\nchains:\n  - name: route\n    steps:\n      - provider: p\n        model: m\n      - provider: b\n        model: m\n")).unwrap();
 app_with_state(AppState::new(config,HashMap::from([("K".into(),"local".into()),("B".into(),"local".into())]),vec!["local".into()]).unwrap())
}
fn req(path: &str, value: Value) -> Request<Body> {Request::builder().method("POST").uri(path).header("authorization","Bearer local").header("content-type","application/json").body(Body::from(value.to_string())).unwrap()}
async fn json_response(response: axum::response::Response) -> Value {serde_json::from_slice(&to_bytes(response.into_body(),64<<20).await.unwrap()).unwrap()}
fn event(value: Value) -> String {format!("data: {value}\n\n")}

#[tokio::test]
async fn truncated_tool_is_emitted_as_completed_item() {
 let sse=event(json!({"id":"test-id","choices":[{"index":0,"delta":{"role":"assistant","tool_calls":[{"index":0,"id":"call1","type":"function","function":{"name":"lookup","arguments":"{\"city\":"}}]},"finish_reason":null}]}))
 + &event(json!({"id":"test-id","choices":[{"index":0,"delta":{},"finish_reason":"length"}]}))+"data: [DONE]\n\n";
 let (url,_)=serve(sse,true).await;let (router,_)=gateway(&url,&url,false);
 let r=router.oneshot(req("/v1/responses",json!({"model":"route","input":"hi","stream":true}))).await.unwrap();
 assert_eq!(r.status(),StatusCode::OK);
 let bytes=to_bytes(r.into_body(),1<<20).await.unwrap();let text=String::from_utf8(bytes.to_vec()).unwrap();
 let values:Vec<Value>=text.lines().filter_map(|l|l.strip_prefix("data: ")).map(|s|serde_json::from_str(s).unwrap()).collect();
 let done=values.iter().find(|v|v["type"]=="response.output_item.done").unwrap();
 assert_eq!(done["item"]["status"],"completed");
 assert!(serde_json::from_str::<Value>(done["item"]["arguments"].as_str().unwrap()).is_err());
 assert!(values.iter().any(|v|v["type"]=="response.incomplete"));
 println!("incomplete tool output: {done}");
}

#[tokio::test]
async fn responses_validation_runs_after_fallback_commit() {
 let mut invalid=completion();invalid.as_object_mut().unwrap().remove("id");
 let (first,_)=serve(invalid.to_string(),false).await;let (backup,calls)=serve(completion().to_string(),false).await;
 let (router,state)=gateway(&first,&backup,false);
 let r=router.oneshot(req("/v1/responses",json!({"model":"route","input":"hi"}))).await.unwrap();
 assert_eq!(r.status(),StatusCode::BAD_GATEWAY);let body=json_response(r).await;
 assert_eq!(body["error"]["code"],"invalid_chat_id");assert_eq!(calls.load(Ordering::SeqCst),0);
 assert_eq!(state.runtime_status()["upstream_success"],1);
 println!("responses result={body}, backup calls=0, upstream_success=1");
}

#[tokio::test]
async fn aggregate_rejects_eof_accepted_by_live_chat() {
 let sse=event(json!({"id":"test-id","choices":[{"index":0,"delta":{"role":"assistant","content":"first"},"finish_reason":"stop"}]}));
 let (first,_)=serve(sse,true).await;let (backup,calls)=serve(completion().to_string(),false).await;
 let (router,_)=gateway(&first,&backup,true);
 let r=router.clone().oneshot(req("/v1/chat/completions",json!({"model":"route","messages":[],"stream":true}))).await.unwrap();
 let text=String::from_utf8(to_bytes(r.into_body(),1<<20).await.unwrap().to_vec()).unwrap();assert!(text.contains("[DONE]"));assert_eq!(calls.load(Ordering::SeqCst),0);
 let r=router.oneshot(req("/v1/chat/completions",json!({"model":"route","messages":[]}))).await.unwrap();
 let body=json_response(r).await;assert_eq!(body["choices"][0]["message"]["content"],"ok");assert_eq!(calls.load(Ordering::SeqCst),1);
 println!("same complete SSE: live chat accepted; aggregation replayed backup");
}

#[tokio::test]
async fn aggregate_rejects_usage_choice_plus_authoritative_trailer() {
 let usage=json!({"prompt_tokens":1,"completion_tokens":1,"total_tokens":2});
 let sse=event(json!({"id":"test-id","choices":[{"index":0,"delta":{"role":"assistant","content":"first"},"finish_reason":"stop"}],"usage":usage}))
 + &event(json!({"id":"test-id","choices":[],"usage":usage}))+"data: [DONE]\n\n";
 let (first,_)=serve(sse,true).await;let (backup,calls)=serve(completion().to_string(),false).await;let (router,_)=gateway(&first,&backup,true);
 let r=router.oneshot(req("/v1/chat/completions",json!({"model":"route","messages":[]}))).await.unwrap();
 let body=json_response(r).await;assert_eq!(body["choices"][0]["message"]["content"],"ok");assert_eq!(calls.load(Ordering::SeqCst),1);
 println!("valid provisional+trailer usage replays backup");
}

#[tokio::test]
async fn buffered_response_bodies_outlive_all_admission_permits() {
 let (url,calls)=serve(completion().to_string(),false).await;let (router,state)=gateway(&url,&url,false);let mut held=Vec::new();
 for _ in 0..130 {let r=router.clone().oneshot(req("/v1/chat/completions",json!({"model":"route","messages":[]}))).await.unwrap();assert_eq!(r.status(),StatusCode::OK);held.push(r);}
 assert_eq!(calls.load(Ordering::SeqCst),130);assert_eq!(state.runtime_status()["active_requests"],0);
 println!("130 unconsumed JSON response bodies retained; active_requests=0");drop(held);
}

#[tokio::test]
async fn nine_requests_keep_parsed_payloads_beyond_eight_payload_slots() {
 let calls=Arc::new(AtomicUsize::new(0));let seen=calls.clone();
 let upstream=Router::new().route("/v1/chat/completions",post(move || {let seen=seen.clone();async move {seen.fetch_add(1,Ordering::SeqCst);std::future::pending::<String>().await}}));
 let listener=tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();let addr=listener.local_addr().unwrap();tokio::spawn(async move {axum::serve(listener,upstream).await.unwrap();});
 let url=format!("http://{addr}");let (router,state)=gateway(&url,&url,false);let mut tasks=Vec::new();
 for _ in 0..9 {let r=router.clone();tasks.push(tokio::spawn(async move {r.oneshot(req("/v1/chat/completions",json!({"model":"route","messages":[],"extra":"x".repeat(1024*1024)}))).await}));}
 tokio::time::timeout(Duration::from_secs(5),async {while calls.load(Ordering::SeqCst)<9 {tokio::task::yield_now().await;}}).await.unwrap();
 assert_eq!(state.runtime_status()["active_requests"],9);println!("9 simultaneous parsed 1 MiB payloads survived the 8-slot memory gate");for t in tasks {t.abort();}
}

#[tokio::test]
async fn upstream_4xx_error_body_escapes_walk_deadline() {
 let upstream=Router::new().route("/v1/chat/completions",post(||async {
  let chunks=futures_util::stream::unfold(0,|i|async move {match i {0=>Some((Ok::<_,std::io::Error>(axum::body::Bytes::from_static(b"{\"error\":")),1)),1=>{tokio::time::sleep(Duration::from_millis(400)).await;Some((Ok(axum::body::Bytes::from_static(b"{}}")),2))},_=>None}});
  (StatusCode::BAD_REQUEST,Body::from_stream(chunks))
 }));
 let listener=tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();let addr=listener.local_addr().unwrap();tokio::spawn(async move {axum::serve(listener,upstream).await.unwrap();});
 let config:Config=serde_yaml::from_str(&format!("timeout:\n  walk: 100ms\nproviders:\n  - name: p\n    type: openai\n    base_url: http://{addr}\n    key_env: K\n")).unwrap();
 let router=guvna::gateway::app(AppState::new(config,HashMap::from([("K".into(),"local".into())]),vec!["local".into()]).unwrap());
 let started=std::time::Instant::now();let r=router.oneshot(req("/v1/chat/completions",json!({"model":"p/m","messages":[]}))).await.unwrap();let elapsed=started.elapsed();
 assert_eq!(r.status(),StatusCode::GATEWAY_TIMEOUT);assert!(elapsed>=Duration::from_millis(350));println!("100ms walk budget returned after {elapsed:?}");
}

#[test]
fn oversized_corrupt_live_chain_cannot_be_recovered_from_valid_backup() {
 use guvna::chain_store::{self,Command};
 let dir=tempfile::tempdir().unwrap();let live=dir.path().join("chains.yaml");
 std::fs::write(&live,vec![b'x';1024*1024+1]).unwrap();std::fs::write(dir.path().join("chains.yaml.bak"),"version: 1\nchains: []\n").unwrap();
 let config:Config=serde_yaml::from_str("providers: []").unwrap();
 let error=chain_store::execute(&config,dir.path(),Command::Recover(None)).unwrap_err();
 assert!(error.contains("at most 1 MiB"));assert_eq!(std::fs::metadata(live).unwrap().len(),1024*1024+1);println!("valid backup recovery refused: {error}");
}
```

</details>

<details>
<summary>memory_repro.py — Release 真实 TCP / RSS 复现</summary>

```python
#!/usr/bin/env python3
"""Local-only real HTTP memory probe. No real provider credentials."""
import concurrent.futures, http.server, json, os, socket, subprocess, sys, tempfile, threading, time, urllib.request
from pathlib import Path
binary=str(Path(sys.argv[1]).resolve())
class Upstream(http.server.ThreadingHTTPServer):
    daemon_threads=True
class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_POST(self):
        self.rfile.read(int(self.headers.get('Content-Length',0)))
        if self.server.mode=='payload':
            with self.server.lock:self.server.calls+=1
            self.server.release.wait(15)
            data=b'{"choices":[{"index":0,"message":{"role":"assistant","content":"ok"},"finish_reason":"stop"}]}'
        else:
            data=self.server.data
        self.send_response(200);self.send_header('Content-Length',str(len(data)));self.send_header('Content-Type','application/json');self.end_headers()
        try:self.wfile.write(data)
        except (BrokenPipeError,ConnectionResetError):pass

def port():
    with socket.socket() as s:s.bind(('127.0.0.1',0));return s.getsockname()[1]
def rss(pid):
    for line in Path(f'/proc/{pid}/status').read_text().splitlines():
        if line.startswith('VmRSS:'):return int(line.split()[1])/1024

def get(gp,path):
    req=urllib.request.Request(f'http://127.0.0.1:{gp}{path}',headers={'Authorization':'Bearer local'})
    return urllib.request.urlopen(req,timeout=3).read().decode()
def active(gp):
    return int(next(l.split()[1] for l in get(gp,'/metrics').splitlines() if l.startswith('guvna_active_requests ')))
results={}
for mode in ['payload','slow-reader']:
    upstream=Upstream(('127.0.0.1',0),Handler);upstream.mode=mode;upstream.calls=0;upstream.lock=threading.Lock();upstream.release=threading.Event()
    upstream.data=json.dumps({'choices':[{'index':0,'message':{'role':'assistant','content':'x'*(8*1024*1024)},'finish_reason':'stop'}]},separators=(',',':')).encode()
    threading.Thread(target=upstream.serve_forever,daemon=True).start()
    with tempfile.TemporaryDirectory(prefix='guvna-audit-') as d:
        gp=port();cfg=Path(d)/'config.yaml';cfg.write_text(f'port: {gp}\nproviders:\n  - name: p\n    type: openai\n    base_url: http://127.0.0.1:{upstream.server_port}\n    key_env: UPSTREAM_LOCAL\n')
        proc=subprocess.Popen([binary,'serve','-config',str(cfg),'-data',str(Path(d)/'data')],env={**os.environ,'API_KEYS':'local','UPSTREAM_LOCAL':'local','GUVNA_BIND_ADDR':'127.0.0.1'},stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        clients=[];pool=None
        try:
            for _ in range(100):
                try:get(gp,'/healthz');break
                except Exception:time.sleep(.05)
            before=rss(proc.pid)
            if mode=='payload':
                # Valid token array, 512 KiB wire; many Value nodes amplify retained memory.
                payload=b'{"model":"p/m","messages":[],"extra":['+b'0,'*(256*1024-1)+b'0]}'
                pool=concurrent.futures.ThreadPoolExecutor(max_workers=12)
                def send():
                    req=urllib.request.Request(f'http://127.0.0.1:{gp}/v1/chat/completions',data=payload,headers={'Authorization':'Bearer local','Content-Type':'application/json'})
                    return urllib.request.urlopen(req,timeout=20).read()
                jobs=[pool.submit(send) for _ in range(12)]
                until=time.monotonic()+10
                while upstream.calls<12 and time.monotonic()<until:time.sleep(.05)
                result={'wire_bytes_per_request':len(payload),'upstream_calls':upstream.calls,'active_requests':active(gp),'rss_before_mib':before,'rss_held_mib':rss(proc.pid)}
                upstream.release.set()
                for j in jobs:j.result()
            else:
                payload=b'{"model":"p/m","messages":[]}'
                for _ in range(12):
                    s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_RCVBUF,1024);s.settimeout(10);s.connect(('127.0.0.1',gp))
                    s.sendall(f'POST /v1/chat/completions HTTP/1.1\r\nHost: localhost\r\nAuthorization: Bearer local\r\nContent-Type: application/json\r\nContent-Length: {len(payload)}\r\n\r\n'.encode()+payload)
                    # Consume headers only, then retain unread response behind TCP backpressure.
                    head=b''
                    while not head.endswith(b'\r\n\r\n'):head+=s.recv(1)
                    assert b'200 OK' in head;clients.append(s)
                time.sleep(.2)
                result={'unread_response_bodies':len(clients),'response_bytes_each':len(upstream.data),'active_requests':active(gp),'rss_before_mib':before,'rss_held_mib':rss(proc.pid)}
            results[mode]=result
        finally:
            upstream.release.set()
            for s in clients:s.close()
            if pool:pool.shutdown(wait=True)
            proc.terminate()
            try:proc.wait(timeout=4)
            except subprocess.TimeoutExpired:proc.kill();proc.wait()
    upstream.shutdown();upstream.server_close()
print(json.dumps({'binary':binary,'results':results},indent=2))
```

</details>

## 修复验收清单

- [ ] F01：length/content_filter 截断工具的 output_item.done 与最终 response 状态一致，残缺参数不标 completed。
- [ ] F02：慢上游时，存活请求树及序列化数据有全局内存预算；同时保留既定并发语义，不能仅按 wire bytes 估计内存。
- [ ] F03：慢下游时，尚未交付的 JSON body 仍占用内存/准入额度；EOF 和客户端断开均正确释放。
- [ ] F04：Responses 必要校验发生在候选成功提交前，畸形结果可切换健康备用且不记为成功；不新增第二套候选遍历。
- [ ] F05：4xx 错误体读取受剩余 walk deadline 限制。
- [ ] F06：只接受所有 choices 完整且没有残帧的 EOF，聚合与实时 Chat 规则一致。
- [ ] F07：临时 usage + 单一权威 trailer 可通过，重复权威 trailer 仍拒绝。
- [ ] F08：有效备份可恢复超限损坏 live 文件，并安全保留原件；无效恢复来源仍不改变现场。
- [ ] 原有完整测试、严格 Clippy、Release 全套资源门禁通过，新增回归覆盖上述实际失败路径。
