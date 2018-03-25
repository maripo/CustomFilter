var PRESET_RULES = [{
        name: "Twitter",
        url: "http://twitter.com",
        rules: [{
                "title": "ハッシュタグフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "twitter.com",
                "specify_url_by_regexp": false,
                "hide_block_css": "DIV.tweet",
                "search_block_css": "P.tweet-text B"
            }, {
                "title": "URLフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "twitter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "A.twitter-timeline-link",
                "hide_block_css": "DIV.tweet"
            }, {
                "title": "ツイート本文フィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "twitter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "P.tweet-text",
                "hide_block_css": "DIV.tweet"
            }, {
                "title": "トレンドフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "twitter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "LI.trend-item",
                "hide_block_css": "LI.trend-item"
            }]
    }, {
        name: "Facebook",
        url: "http://www.facebook.com",
        rules: [{
                "title": "コメントフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.facebook.com",
                "specify_url_by_regexp": false,
                "search_block_css": "",
                "hide_block_css": "LI.display"
            }, {
                "title": "コメントを投稿者でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.facebook.com",
                "specify_url_by_regexp": false,
                "search_block_css": "A.UFICommentActorName",
                "hide_block_css": "LI.display"
            }]
    }, {
        name: "Google+",
        url: "https://plus.google.com",
        rules: [{
                "title": "本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "plus.google.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.VC",
                "hide_block_css": "DIV.Sb"
            }]
    }, {
        name: "Google検索",
        url: "https://www.google.com",
        rules: [{
                "title": "URLフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.google.co",
                "specify_url_by_regexp": false,
                "search_block_css": "CITE",
                "hide_block_css": "LI.g"
            }, {
                "title": "タイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.google.co",
                "specify_url_by_regexp": false,
                "search_block_css": "H3>A",
                "hide_block_css": "LI.g"
            },
            {
                "title": "要約文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.google.co",
                "specify_url_by_regexp": false,
                "search_block_css": "SPAN.st",
                "hide_block_css": "LI.g"
            }]
    }, {
        name: "Amazon.co*",
        url: "http://www.amazon.com/",
        rules: [{
                "title": "レビューフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.amazon.co",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.pc DIV.reviews",
                "hide_block_css": "DIV.pc DIV.reviews"
            }, {
                "title": "商品サーチフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.amazon.co",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.prod",
                "hide_block_css": "DIV.prod"
            }]
    }, {
        name: "Slashdot",
        url: "http://slashdot.org/",
        rules: [{
                "title": "ストーリーをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "slashdot.org",
                "specify_url_by_regexp": false,
                "search_block_css": "H2.story A",
                "hide_block_css": "ARTICLE"
            }, {
                "title": "ストーリーをタレコミ人でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "slashdot.*",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.details>A",
                "hide_block_css": "ARTICLE"
            }, {
                "title": "ストーリーを内容でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "slashdot.*",
                "specify_url_by_regexp": false,
                "search_block_css": "SECTION I",
                "hide_block_css": "ARTICLE"
            }, {
                "title": "コメントフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "slashdot.*",
                "specify_url_by_regexp": false,
                "search_block_css": "LI.full DIV.commentBody",
                "hide_block_css": "LI.full DIV.commentBody"
            }]
    }, {
        name: "LinkedIn",
        url: "http://www.linkedin.com/",
        rules: [{
                "title": "フィードを本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.linkedin.com",
                "specify_url_by_regexp": false,
                "search_block_css": "LI.feed-item",
                "hide_block_css": "LI.feed-item"
            }]
    }, {
        name: "Foursquare",
        url: "https://foursquare.com/activity",
        rules: [{
                "title": "Tipsをフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "foursquare.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.tipsSections LI",
                "hide_block_css": "DIV.tipsSections LI"
            }, {
                "title": "べニューの名前でチェックイン情報をフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "foursquare.com",
                "specify_url_by_regexp": false,
                "search_block_css": "a.venue,H5>A,#userHistory A",
                "hide_block_css": "DIV.activity,DIV.tip,DIV.historyItem"
            }]
    }, {
        name: "Googleニュース",
        url: "https://news.google.com/",
        rules: [{
                "title": "ニュースをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "news.google.co",
                "specify_url_by_regexp": false,
                "search_block_css": "H2 SPAN.titletext",
                "hide_block_css": "DIV.esc-body"
            }, {
                "title": "ニュースを提供元でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "news.google.co",
                "specify_url_by_regexp": false,
                "search_block_css": "TD.source-cell>SPAN",
                "hide_block_css": "DIV.esc-body"
            }]
    }, {
        name: "YouTube",
        url: "http://www.youtube.com/",
        rules: [{
                "title": "タイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "youtube.com",
                "specify_url_by_regexp": false,
                "search_block_css": "H3 A,SPAN.title",
                "hide_block_css": "LI.clearfix,LI.video-list-item"
            }, {
                "title": "コメントフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "youtube.com",
                "specify_url_by_regexp": false,
                "search_block_css": "LI.comment",
                "hide_block_css": "LI.comment"
            }]
    },
    {
        name: "はてなブックマーク",
        url: "http://b.hatena.ne.jp/",
        rules: [{
                "title": "エントリをドメインでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "b.hatena.ne.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "A.domain>SPAN,CITE A",
                "hide_block_css": "LI.track-click-entry,LI.search-result,LI.entrylist-unit"
            }, {
                "title": "エントリをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "b.hatena.ne.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "H3>A",
                "hide_block_css": "LI.track-click-entry,LI.search-result,LI.entrylist-unit"
            }, {
                "title": "ブックマークをタグでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "b.hatena.ne.jp/entry",
                "specify_url_by_regexp": false,
                "search_block_css": "A.user-tag",
                "hide_block_css": "UL.bookmark-list>LI"
            }, {
                "title": "ブックマークを本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "b.hatena.ne.jp/entry",
                "specify_url_by_regexp": false,
                "search_block_css": "SPAN.comment",
                "hide_block_css": "UL.bookmark-list>LI"
            }]
    }, {
        name: "ニコニコ動画",
        url: "http://www.nicovideo.jp/",
        rules: [{
                "title": "動画をタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "www.nicovideo.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "A.watch",
                "hide_block_css": "#mainContainer TR"
            }]
    }, {
        name: "2ちゃんねる",
        url: "http://www.2ch.net/",
        rules: [{
                "title": "スレタイフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "2ch.net",
                "specify_url_by_regexp": false,
                "search_block_css": "A",
                "hide_block_css": "TD A,#trad>A"
            }, {
                "title": "書き込み本文をフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "2ch.net/test/read.cgi/",
                "specify_url_by_regexp": false,
                "search_block_css": "DD",
                "hide_block_css": "DD"
            }]
    }, {
        name: "mixi",
        url: "http://mixi.jp/",
        rules: [{
                "title": "タイムラインをユーザ名でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "mixi.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "P.name>A",
                "hide_block_css": "UL.homeFeedList>LI"
            }, {
                "title": "タイムラインを本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "mixi.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "LI.voice P.description",
                "hide_block_css": "UL.homeFeedList>LI"
            }, {
                "title": "コミュニティ投稿を本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "http://mixi.jp/view_bbs.pl",
                "specify_url_by_regexp": false,
                "search_block_css": "DL.commentContent01>DD",
                "hide_block_css": "DL.commentList01 DL"
            }, {
                "title": "コミュニティ投稿を投稿者名でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "http://mixi.jp/view_bbs.pl",
                "specify_url_by_regexp": false,
                "search_block_css": "DL.commentContent01 A",
                "hide_block_css": "DL.commentList01 DL"
            }]
    }, {
        name: "食べログ",
        url: "http://tabelog.com/",
        rules: [{
                "title": "店名フィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "tabelog.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.mname A",
                "hide_block_css": "LI.clearfix"
            }, {
                "title": "レビューフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "tabelog.com",
                "specify_url_by_regexp": false,
                "search_block_css": "#contents-review LI",
                "hide_block_css": "#contents-review LI"
            }]
    }, {
        name: "Cookpad",
        url: "http://cookpad.com/",
        rules: [{
                "title": "レシピを材料でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "http://cookpad.com/search/",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.material",
                "hide_block_css": "DIV.recipe-preview"
            }, {
                "title": "レシピをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "http://cookpad.com/search/",
                "specify_url_by_regexp": false,
                "search_block_css": "A.recipe-title",
                "hide_block_css": "DIV.recipe-preview"
            }, {
                "title": "レシピを投稿者名でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "http://cookpad.com/search/",
                "specify_url_by_regexp": false,
                "search_block_css": "SPAN.font12>A",
                "hide_block_css": "DIV.recipe-preview"
            }]
    }, {
        name: "Togetter",
        url: "http://togetter.com/",
        rules: [{
                "title": "まとめをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "togetter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "H3>A",
                "hide_block_css": "DIV.contents LI"
            }, {
                "title": "まとめをタグでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "togetter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "A.category_link",
                "hide_block_css": "DIV.contents LI"
            }, {
                "title": "ツイートを本文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "togetter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.tweet",
                "hide_block_css": "DIV.type_tweet"
            }, {
                "title": "ツイートを投稿者でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "togetter.com",
                "specify_url_by_regexp": false,
                "search_block_css": "LI A.status_name",
                "hide_block_css": "DIV.type_tweet"
            }]
    }, {
        name: "Naverまとめ",
        url: "http://matome.naver.jp/",
        rules: [{
                "title": "まとめをタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "matome.naver.jp",
                "specify_url_by_regexp": false,
                "search_block_css": "H3>A",
                "hide_block_css": "LI"
            }]
    }, {
        name: "Digg",
        url: "http://digg.com/",
        rules: [{
                "title": "タイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "digg.com",
                "specify_url_by_regexp": false,
                "search_block_css": "ARTICLE A.story-link",
                "hide_block_css": "ARTICLE"
            }, {
                "title": "ドメインでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "digg.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.story-meta A",
                "hide_block_css": "ARTICLE"
            }, {
                "title": "要約文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "digg.com",
                "specify_url_by_regexp": false,
                "search_block_css": "ARTICLE P",
                "hide_block_css": "ARTICLE"
            }]
    }, {
        name: "StackOverflow",
        url: "http://stackoverflow.com/",
        rules: [
            {
                "title": "質問をタグでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "stackoverflow.com/questions",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.tags>A",
                "hide_block_css": "DIV.question-summary"
            },
            {
                "title": "質問をタイトルでフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "stackoverflow.com/questions",
                "specify_url_by_regexp": false,
                "search_block_css": "H3>A",
                "hide_block_css": "DIV.question-summary"
            }, {
                "title": "質問を要約文でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "stackoverflow.com/questions",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.excerpt",
                "hide_block_css": "DIV.question-summary"
            },
            {
                "title": "質問を投稿者名でフィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "stackoverflow.com/questions",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.user-details>A",
                "hide_block_css": "DIV.question-summary"
            }
        ]
    }, {
        name: "Github",
        url: "https://github.com/",
        rules: [{
                "title": "News Feed & Public Activity フィルタ",
                "search_block_by_css": true,
                "hide_block_by_css": true,
                "site_regexp": "github.com",
                "specify_url_by_regexp": false,
                "search_block_css": "DIV.alert",
                "hide_block_css": "DIV.alert"
            }]
    }];
//# sourceMappingURL=preset_ja.js.map