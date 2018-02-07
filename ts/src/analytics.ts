var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-877593-4']);
_gaq.push(['_trackPageview']);

(function() {
	let ga = document.createElement('script'); ga.type = 'text/javascript';
	ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

class Analytics {
	public static trackEvent (key:string, value:string) {
		_gaq.push(['_trackEvent', key, value]);
	}
}