use std::{fs, path::Path};

pub fn title_from_html_file(path: &Path) -> Option<String> {
    let html = fs::read_to_string(path).ok()?;
    title_from_html(&html)
}

pub fn title_from_html(html: &str) -> Option<String> {
    let lower = html.to_lowercase();
    let start_tag = lower.find("<title")?;
    let title_start = lower[start_tag..].find('>')? + start_tag + 1;
    let title_end = lower[title_start..].find("</title>")? + title_start;
    let title = html[title_start..title_end].trim();

    if title.is_empty() {
        None
    } else {
        Some(decode_basic_entities(title))
    }
}

fn decode_basic_entities(value: &str) -> String {
    value
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}

pub fn fallback_title(path: &Path) -> String {
    path.file_stem()
        .and_then(|name| name.to_str())
        .filter(|name| !name.trim().is_empty())
        .unwrap_or("Untitled slide")
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::title_from_html;

    #[test]
    fn extracts_title_from_html() {
        assert_eq!(
            title_from_html("<html><head><title>Deck &amp; Demo</title></head></html>"),
            Some("Deck & Demo".to_string())
        );
    }

    #[test]
    fn returns_none_when_title_is_missing() {
        assert_eq!(title_from_html("<html><head></head></html>"), None);
    }
}
