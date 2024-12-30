use oxc::{ast::ast, semantic::SymbolFlags};
use oxc_traverse::TraverseCtx;

use crate::core::shared::{
    constants::{SVG_ELEMENTS, VOID_ELEMENTS},
    transform::{JsxTransform, TransformInfo, TransformResult},
    utils::{filter_children, get_tag_name},
};

impl<'a> JsxTransform<'a> {
    pub fn transform_element_dom(
        &mut self,
        el: &mut ast::JSXElement<'a>,
        ctx: &mut TraverseCtx<'a>,
        info: &TransformInfo,
    ) -> TransformResult<'a> {
        let tag_name = get_tag_name(el);
        let wrap_svg = info.top_level && tag_name != "svg" && SVG_ELEMENTS.contains(&tag_name.as_str());
        let void_tag = VOID_ELEMENTS.contains(&tag_name.as_str());
        let is_custom_element = tag_name.contains('-');

        let attributes = self.generate_attributes_dom(&el.opening_element.attributes);
        let child_templates = self.generate_child_templates_dom(&mut el.children, ctx);

        // TODO
        let template = format!("<{}{}>{}", tag_name, attributes, child_templates);

        TransformResult {
            id: match info.skip_id {
                true => None,
                false => Some(ctx.generate_uid_in_current_scope("el$", SymbolFlags::FunctionScopedVariable).name),
            },
            template: Some(template),
            exprs: ctx.ast.vec(),
            declarators: ctx.ast.vec(),
            text: false,
            dynamic: false,
            skip_template: false,
        }
    }

    /// generate attributes string without quotes around values
    fn generate_attributes_dom(&self, attrs: &[ast::JSXAttributeItem<'a>]) -> String {
        let mut attrs_string = String::new();
        for attr_item in attrs {
            let ast::JSXAttributeItem::Attribute(attr) = attr_item else {
                continue;
            };
            let ast::JSXAttributeName::Identifier(ident) = &attr.name else {
                continue;
            };
            let name = ident.name.as_ref();

            match &attr.value {
                Some(ast::JSXAttributeValue::StringLiteral(str_lit)) => {
                    let value = str_lit.value.as_ref();
                    attrs_string.push_str(&format!(" {}={}", name, value));
                }
                Some(_) => {
                    // TODO
                }
                None => {
                    // attributes without a value (e.g., <input disabled />)
                    attrs_string.push_str(&format!(" {}", name));
                }
            }
        }
        attrs_string
    }

    /// Process children and collect their templates
    fn generate_child_templates_dom(&mut self, children: &mut [ast::JSXChild<'a>], ctx: &mut TraverseCtx<'a>) -> String {
        let info = TransformInfo::default();
        filter_children(children)
            .filter_map(|child| self.transform_node(child, ctx, &info)?.template)
            .collect::<String>()
    }
}
