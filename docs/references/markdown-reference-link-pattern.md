# Markdown reference-link pattern

## Source pattern
The requested authoring shape is citation-style markdown such as:

```md
This report covers the exact GitHub repository [`shiyu-coder/Kronos`](https://github.com/shiyu-coder/Kronos), not unrelated same-name software.[^repo][^paper][^demo]

[^repo]: [GitHub repository: shiyu-coder/Kronos](https://github.com/shiyu-coder/Kronos)
[^paper]: [Kronos: A Foundation Model for the Language of Financial Markets (arXiv)](https://arxiv.org/abs/2508.02739)
[^demo]: [Official live demo: Kronos Live Forecast | BTC/USDT](https://shiyu-coder.github.io/Kronos-demo/)
```

## Product takeaway
- The main prose should stay readable without a cluster of raw inline URLs.
- Readers should find all source links in one bottom section instead of scanning the whole note for them.
- The first shipped slice can stay narrow by supporting footnote markers plus single-link definitions instead of the entire Markdown footnote spec.
- Shipped fallback behavior is deliberately narrow: malformed or multi-line definitions, and unused duplicate definitions, stay in the article body instead of being coerced into a richer footnote model.
- Owner preview and published note reading should share one reference-extraction path so the author sees the same output that public readers get.
