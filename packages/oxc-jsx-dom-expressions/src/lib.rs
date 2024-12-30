use napi::bindgen_prelude::*;
use napi_derive::*;

use crate::config::Config;

pub mod config;
mod core;

#[napi]
pub fn transform(source: String, config: Option<Config>) -> Result<String> {
    Ok(core::transform(source, config.unwrap_or_default().into()).unwrap())
}
