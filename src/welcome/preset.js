var PRESET_RULES = [ {
	name : "Twitter",
	url : "http://twitter.com",
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
		"search_block_css" : "LI.trend-item",
		"hide_block_css" : "LI.trend-item"
	} ]
}, {
	name : "Facebook",
	url : "http://www.facebook.com",
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
	url : "https://plus.google.com",
	rules : [ {
		"title" : "Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "plus.google.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.VC",
		"hide_block_css" : "DIV.Sb"
	} ]
}, {
	name : "Google Search",
	url : "https://www.google.com",
	rules : [ {
		"title" : "URL Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "CITE",
		"hide_block_css" : "LI.g"
	}, {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3>A",
		"hide_block_css" : "LI.g"
	},

	{
		"title" : "Summary Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.st",
		"hide_block_css" : "LI.g"
	} ]
}, {
	name : "Baidu Search",
	url : "http://www.baidu.com",
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
	url : "http://answers.yahoo.com/",
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
	url : "https://github.com/",
	rules : [{
		"title" : "News Feed & Public Activity Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "github.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.alert",
		"hide_block_css" : "DIV.alert"
	}]
}, {
	name : "Digg",
	url : "http://digg.com/",
	rules : [{
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "ARTICLE A.story-link",
		"hide_block_css" : "ARTICLE"
	},
	{
		"title" : "Dimain Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.story-meta A",
		"hide_block_css" : "ARTICLE"
	},
	{
		"title" : "Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "ARTICLE P",
		"hide_block_css" : "ARTICLE"
	}]
},  {
	name : "Amazon.com",
	url : "http://www.amazon.com/",
	rules : []
}, {
	name : "Amazon.co.*",
	url : "http://www.amazon.co.jp/",
	rules : []
}, {
	name : "Slashdot",
	url : "http://slashdot.org/",
	rules : [{
		"title" : "Filter Stories by Titles",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H2.story A",
		"hide_block_css" : "ARTICLE"
	},
	{
		"title" : "Filter Stories by Users",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.details>A",
		"hide_block_css" : "ARTICLE"
	},
	{
		"title" : "Filter Stories by Contents",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SECTION I",
		"hide_block_css" : "ARTICLE"
	},
	{
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI.full DIV.commentBody",
		"hide_block_css" : "LI.full DIV.commentBody"
	}]
}, {
	name : "LinkedIn",
	url : "http://www.linkedin.com/",
	rules : []
}, {
	name : "MySpace",
	url : "https://myspace.com/",
	rules : []
}, {
	name : "DeviantArt",
	url : "http://www.deviantart.com/",
	rules : []
}, {
	name : "Foursquare",
	url : "https://foursquare.com/activity",
	rules : [{
		"title" : "Tips Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.tipsSections LI",
		"hide_block_css" : "DIV.tipsSections LI"
	},
	{
		"title" : "Venue Name Filter for Activity Page",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.create DIV.text,DIV.venueDetails",
		"hide_block_css" : "DIV.create DIV.text,DIV.venueDetails"
	}]
}, {
	name : "Google News",
	url : "https://news.google.com/",
	rules : [{
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H2 SPAN.titletext",
		"hide_block_css" : "DIV.esc-body"
	},
	{
		"title" : "Source Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "TD.source-cell>SPAN",
		"hide_block_css" : "DIV.esc-body"
	}]
}, {
	name : "StackOverflow",
	url : "http://stackoverflow.com/",
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
	}, {
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
	} ]
}, {
	name : "Reddit",
	url : "http://www.reddit.com/",
	rules : []
}, {
	name : "YouTube",
	url : "http://www.youtube.com/",
	rules : []
}, {
	name : "Hatena Bookmark",
	url : "http://b.hatena.ne.jp/",
	rules : []
}, {
	name : "Livedoor Reader",
	url : "http://reader.livedoor.com/",
	rules : []
}, {
	name : "Nico Nico Douga",
	url : "http://www.nicovideo.jp/",
	rules : []
}, {
	name : "2chanel",
	url : "http://www.2ch.net/",
	rules : []
}, {
	name : "mixi",
	url : "http://mixi.jp/",
	rules : []
}, {
	name : "Tabelog",
	url : "http://tabelog.com/",
	rules : []
}, {
	name : "Cookpad",
	url : "http://cookpad.com/",
	rules : [{
		"title" : "Ingredients Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.material",
		"hide_block_css" : "DIV.recipe-preview"
	},{
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.recipe-title",
		"hide_block_css" : "DIV.recipe-preview"
	},{
		"title" : "User Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.font12>A",
		"hide_block_css" : "DIV.recipe-preview"
	}]
}, {
	name : "Togetter",
	url : "http://togetter.com/",
	rules : []
}, {
	name : "Naver Matome",
	url : "http://matome.naver.jp/",
	rules : []
}, {
	name : "Pixiv",
	url : "http://www.pixiv.net/",
	rules : []
}, {
	name : "Yahoo Chiebukuro",
	url : "http://chiebukuro.yahoo.co.jp/",
	rules : []
} ];
// TODO yelp, ameba now, 4chan, last.fm, kakaku.com, rottentomato, Yahoo Auction, Tumblr