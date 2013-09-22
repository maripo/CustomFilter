var PRESET_RULES = [ {
	name : "Twitter",
	url: "http://twitter.com",
	rules : [ {
		"title" : "Hashtag Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"hide_block_css" : "OL>LI",
		"search_block_css" : "P.tweet-text B"
	}, {
		"title" : "URL Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "OL>LI",
		"hide_block_css" : "A.twitter-timeline-link"
	}, {
		"title" : "Tweet Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "P.tweet-text",
		"hide_block_css" : "A.twitter-timeline-link"
	}, {
		"title" : "Trends Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "P.tweet-text",
		"hide_block_css" : "P.tweet-text"
	}
	]
}, {
	name : "Facebook",
	url: "http://www.facebook.com",
	// Content Filter
	rules : [ {
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.facebook.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "UL.mtm LI.display",
		"hide_block_css" : ""
	}, {
		"title" : "Comment Filter (by users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.facebook.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "UL.mtm LI.display",
		"hide_block_css" : "UL.mtm A.UFICommentActorName"
	} ]
}, {
	name : "Google+",
	url: "https://plus.google.com",
	rules : [ {
		"title" : "Comment Filter (by users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "plus.google.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.VC",
		"hide_block_css" : "DIV.Sb"
	} ]
}, {
	name : "Google Search",
	url: "https://www.google.com",
	// URL Filter
	// Snippet Filter
	// Title Filter
	rules : []
}, {
	name : "Baidu Search",
	url: "http://www.baidu.com",
	rules : [ {
		"title" : "URL Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.baidu.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "#in SPAN",
		"hide_block_css" : "TD.c-default"
	}, {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.baidu.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "h3.t",
		"hide_block_css" : "TD.c-default"
	}, {
		"title" : "Summary Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.baidu.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.c-abstract",
		"hide_block_css" : "TD.c-default"
	} ]
}, {
	name : "Yahoo Answers",
	url: "http://answers.yahoo.com/",
	rules : [

	{
		"title" : "Summary Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "answers.yahoo.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.question-description",
		"hide_block_css" : "#ya-col-2 LI"
	}, {
		"title" : "Category Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "answers.yahoo.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.question-meta>A",
		"hide_block_css" : "#ya-col-2 LI"
	}, {
		"title" : "Author Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "answers.yahoo.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.question-meta>A",
		"hide_block_css" : "#ya-col-2 LI"
	} ]
}, {
	name : "Github",
	url: "https://github.com/",
	rules : []
}, {
	name : "Digg",
	url: "http://digg.com/",
	rules : []
}, {
	name : "eBay",
	url: "http://www.ebay.com/",
	rules : []
}, {
	name : "Amazon.com",
	url: "http://www.amazon.com/",
	rules : []
}, {
	name : "Amazon.co.*",
	url: "http://www.amazon.co.jp/",
	rules : []
}, {
	name : "Slashdot",
	url: "http://slashdot.org/",
	rules : []
}, {
	name : "Tumblr",
	url: "https://www.tumblr.com/",
	rules : []
}, {
	name : "LinkedIn",
	url: "http://www.linkedin.com/",
	rules : []
}, {
	name : "MySpace",
	rules : []
}, {
	name : "DeviantArt",
	rules : []
}, {
	name : "Foursquare",
	rules : []
}, {
	name : "Google News",
	rules : []
}, {
	name : "StackOverflow",
	rules : [

	{
		"title" : "Tag Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "stackoverflow.com/questions",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.tags>A",
		"hide_block_css" : "DIV.question-summary"
	},

	{
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "stackoverflow.com/questions",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3>A",
		"hide_block_css" : "DIV.question-summary"
	},
	{
		"title" : "Summary Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "stackoverflow.com/questions",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.excerpt",
		"hide_block_css" : "DIV.question-summary"
	},

	{
		"title" : "Author Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "stackoverflow.com/questions",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.user-details>A",
		"hide_block_css" : "DIV.question-summary"
	}]
}, {
	name : "Reddit",
	rules : []
}, {
	name : "YouTube",
	rules : []
}, {
	name : "Hatena Bookmark",
	rules : []
}, {
	name : "Livedoor Reader",
	rules : []
}, {
	name : "Nico Nico Douga",
	rules : []
}, {
	name : "2chanel",
	rules : []
}, {
	name : "mixi",
	rules : []
}, {
	name : "Tabelog",
	rules : []
}, {
	name : "Cookpad",
	rules : []
}, {
	name : "Togetter",
	rules : []
}, {
	name : "Naver Matome",
	rules : []
}, {
	name : "Pixiv",
	rules : []
}, {
	name : "Yahoo Chiebukuro",
	rules : []
} ];
