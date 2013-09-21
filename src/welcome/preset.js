var PRESET_RULES = [ {
	name : "Twitter",
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
		"search_block_by_css" : false,
		"hide_block_by_css" : false,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "OL>LI",
		"hide_block_css" : "A.twitter-timeline-link"
	} ]
}, {
	name : "Facebook",
	rules : [ {
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.facebook.com*",
		"specify_url_by_regexp" : false,
		"search_block_css" : "UL.mtm LI.display",
		"hide_block_css" : ""
	}, {
		"title" : "Comment Filter (by users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.facebook.com*",
		"specify_url_by_regexp" : false,
		"search_block_css" : "UL.mtm LI.display",
		"hide_block_css" : "UL.mtm A.UFICommentActorName"
	} ]
}, {
	name : "Google+",
	rules : []
}, {
	name : "Google Search",
	rules : []
}, {
	name : "Baidu Search",
	rules : []
}, {
	name : "Yahoo Answers",
	rules : []
}, {
	name : "Github",
	rules : []
}, {
	name : "Digg",
	rules : []
}, {
	name : "eBay",
	rules : []
}, {
	name : "Amazon.com",
	rules : []
}, {
	name : "Amazon.co.*",
	rules : []
}, {
	name : "Slashdot",
	rules : []
}, {
	name : "Tumblr",
	rules : []
}, {
	name : "LinkedIn",
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
	rules : []
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
