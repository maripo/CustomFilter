var PRESET_RULES = [ {
	name : "Twitter",
	url : "http://twitter.com",
	rules : [ {
		"title" : "Hashtag Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"hide_block_css" : "DIV.tweet",
		"search_block_css" : "P.tweet-text B"
	}, {
		"title" : "URL Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.twitter-timeline-link",
		"hide_block_css" : "DIV.tweet"
	}, {
		"title" : "Tweet Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "twitter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "P.tweet-text",
		"hide_block_css" : "DIV.tweet"
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
		"search_block_css" : "",
		"hide_block_css" : "LI.display"
	}, {
		"title" : "Comment Filter (by users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.facebook.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.UFICommentActorName",
		"hide_block_css" : "LI.display"
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
	/* <- Test OK */
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
	rules : [ {
		"title" : "News Feed & Public Activity Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "github.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.alert",
		"hide_block_css" : "DIV.alert"
	} ]
}, {
	name : "Digg",
	url : "http://digg.com/",
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "ARTICLE A.story-link",
		"hide_block_css" : "ARTICLE"
	}, {
		"title" : "Dimain Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.story-meta A",
		"hide_block_css" : "ARTICLE"
	}, {
		"title" : "Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "ARTICLE P",
		"hide_block_css" : "ARTICLE"
	} ]
}, {
	name : "Amazon.co*",
	url : "http://www.amazon.com/",
	rules : [{
		"title" : "Review Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.pc DIV.reviews",
		"hide_block_css" : "DIV.pc DIV.reviews"
	},{
		"title" : "Item Search Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "digg.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.prod",
		"hide_block_css" : "DIV.prod"
	}]
}, {
	name : "Slashdot",
	url : "http://slashdot.org/",
	rules : [ {
		"title" : "Filter Stories by Titles",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H2.story A",
		"hide_block_css" : "ARTICLE"
	}, {
		"title" : "Filter Stories by Users",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.details>A",
		"hide_block_css" : "ARTICLE"
	}, {
		"title" : "Filter Stories by Contents",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SECTION I",
		"hide_block_css" : "ARTICLE"
	}, {
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI.full DIV.commentBody",
		"hide_block_css" : "LI.full DIV.commentBody"
	} ]
}, {
	name : "LinkedIn",
	url : "http://www.linkedin.com/",
	rules : [{
		"title" : "Feed Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.linkedin.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.feed-content A",
		"hide_block_css" : "LI.full DIV.commentBody"
	}]
}, {
	name : "Foursquare",
	url : "https://foursquare.com/activity",
	rules : [ {
		"title" : "Tips Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.tipsSections LI",
		"hide_block_css" : "DIV.tipsSections LI"
	}, {
		"title" : "Venue Name Filter for Activity Page",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "slashdot.org",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.create DIV.text,DIV.venueDetails",
		"hide_block_css" : "DIV.create DIV.text,DIV.venueDetails"
	} ]
}, {
	name : "Google News",
	url : "https://news.google.com/",
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H2 SPAN.titletext",
		"hide_block_css" : "DIV.esc-body"
	}, {
		"title" : "Source Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "TD.source-cell>SPAN",
		"hide_block_css" : "DIV.esc-body"
	} ]
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
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.reddit.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "#siteTable A.title",
		"hide_block_css" : "DIV.link"
	},

	{
		"title" : "Domain Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.reddit.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.domain>A",
		"hide_block_css" : "DIV.link"
	},

	{
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.reddit.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.comment P",
		"hide_block_css" : "DIV.comment P"
	} ]
}, {
	name : "YouTube",
	url : "http://www.youtube.com/",
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "youtube.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3 SPAN",
		"hide_block_css" : "LI.clearfix"
	}, {
		"title" : "Comment Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "youtube.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI.comment",
		"hide_block_css" : "LI.comment"
	}, {
		"title" : "Related Movies Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "youtube.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "#content SPAN.title",
		"hide_block_css" : "A.related-video"
	} ]
}, 
 {
	name : "Rotten Tomatoes",
	url : "http://www.rottentomatoes.com/",
	rules : [ {
		"title" : "Review Filter (by Contents)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.user_review",
		"hide_block_css" : "#content DIV.media_block"
	},{
		"title" : "Review Filter (by Users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "news.google.co",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.fl>A",
		"hide_block_css" : "#content DIV.media_block"
	} ]
},
/* Japan */
{
	name : "Hatena Bookmark",
	url : "http://b.hatena.ne.jp/",
	rules : [{
		"title" : "Domain Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "b.hatena.ne.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.domain>SPAN,CITE A",
		"hide_block_css" : "LI.entry-unit,LI.search-result"
	},{
		"title" : "Entry Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "b.hatena.ne.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3>A",
		"hide_block_css" : "LI.entry-unit,LI.search-result"
	},{
		"title" : "Comment Filter (by Tags)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "b.hatena.ne.jp/entry",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.user-tag",
		"hide_block_css" : "UL.bookmark-list>LI"
	},{
		"title" : "Comment Filter (by Contents)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "b.hatena.ne.jp/entry",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.comment",
		"hide_block_css" : "UL.bookmark-list>LI"
	}]
}, {
	name : "Nico Nico Douga",
	url : "http://www.nicovideo.jp/",
	rules : [{
		"title" : "Thread Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "www.nicovideo.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.watch",
		"hide_block_css" : "TR"
	}]
}, {
	name : "2channel",
	url : "http://www.2ch.net/",
	rules : [{
		"title" : "Thread Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "2ch.net",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A",
		"hide_block_css" : "TD A,#trad>A"
	},{
		"title" : "Content Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "2ch.net/test/read.cgi/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DD",
		"hide_block_css" : "DD"
	}]
}, {
	name : "mixi",
	url : "http://mixi.jp/",
	rules : [{
		"title" : "Timeline Filter (by Users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "mixi.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "P.name>A",
		"hide_block_css" : "UL.homeFeedList>LI"
	},{
		"title" : "Timeline Filter (by Contents)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "mixi.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI.voice P.description",
		"hide_block_css" : "UL.homeFeedList>LI"
	},{
		"title" : "Community Comment Filter (by Contents)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://mixi.jp/view_bbs.pl",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DL.commentContent01>DD",
		"hide_block_css" : "DL.commentList01 DL"
	},{
		"title" : "Community Comment Filter (by Users)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://mixi.jp/view_bbs.pl",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DL.commentContent01 A",
		"hide_block_css" : "DL.commentList01 DL"
	}]
}, {
	name : "Tabelog",
	url : "http://tabelog.com/",
	rules : [{
		"title" : "Restaurant Name Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "tabelog.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.mname A",
		"hide_block_css" : "LI.clearfix"
	},{
		"title" : "Review Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "tabelog.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "#contents-review LI",
		"hide_block_css" : "#contents-review LI"
	}]
}, {
	name : "Cookpad",
	url : "http://cookpad.com/",
	rules : [ {
		"title" : "Ingredients Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.material",
		"hide_block_css" : "DIV.recipe-preview"
	}, {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.recipe-title",
		"hide_block_css" : "DIV.recipe-preview"
	}, {
		"title" : "User Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "http://cookpad.com/search/",
		"specify_url_by_regexp" : false,
		"search_block_css" : "SPAN.font12>A",
		"hide_block_css" : "DIV.recipe-preview"
	} ]
}, {
	name : "Togetter",
	url : "http://togetter.com/",
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "togetter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3>A",
		"hide_block_css" : "DIV.contents LI"
	},{
		"title" : "Tag Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "togetter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "A.category_link",
		"hide_block_css" : "DIV.contents LI"
	},{
		"title" : "Tweet Filter (by Contents)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "togetter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "DIV.tweet",
		"hide_block_css" : "DIV.type_tweet"
	},{
		"title" : "Tweet Filter (by Authors)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "togetter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI A.status_name",
		"hide_block_css" : "DIV.type_tweet"
	},{
		"title" : "Tweet Filter (by Authors)",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "togetter.com",
		"specify_url_by_regexp" : false,
		"search_block_css" : "LI A.status_name",
		"hide_block_css" : "DIV.type_tweet"
	}]
}, {
	name : "Naver Matome",
	url : "http://matome.naver.jp/",
	rules : [ {
		"title" : "Title Filter",
		"search_block_by_css" : true,
		"hide_block_by_css" : true,
		"site_regexp" : "matome.naver.jp",
		"specify_url_by_regexp" : false,
		"search_block_css" : "H3>A",
		"hide_block_css" : "LI"
	} ]
} ];
// TODO yelp, ameba now, 4chan, last.fm, kakaku.com,  Yahoo Auction, Tumblr, MySpace, DeviantArt, Pixiv, Yahoo Chiebukuro, livedoor reader