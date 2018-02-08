/**
 * SmartPathAnalyzer
 */
/*
 * Usage
			var analyzer = new SmartPathAnalyzer(node, (Xpath|Css)Builder);
			var list = analyzer.createPathList();
 */
 class SmartPathAnalyzer {
 	_node:HTMLElement;
 	builder:PathBuilder;
 	appliedRuleList:Rule[];
 	addedHidePaths:string[];
 	addedSearchPaths:string[];
 	constructor (_node:HTMLElement, builder:PathBuilder, appliedRuleList:Rule[]) {
		this._node = _node;
		this.builder = builder;
		this.appliedRuleList = appliedRuleList;
	}
	createPathList (): SmartPath[] {
		// Added paths (avoid adding duplicated paths)
		this.addedHidePaths = [];
		this.addedSearchPaths = [];
		
		var hideOriginalNode = this._node;
		let pathList:SmartPath[] = [];
		while (hideOriginalNode) {
			var siblings = CustomBlockerUtil.getSimilarSiblings(hideOriginalNode);
			if (siblings.length>0) {
				this.analyzerHideNode(hideOriginalNode, this._node, pathList);
			}
			hideOriginalNode = <HTMLElement>hideOriginalNode.parentNode;
		}
		return pathList;
	}
	analyzerHideNode (hideOriginalNode:HTMLElement, originalNode:HTMLElement, pathList:SmartPath[]):void {
		let hidePathSelectors = new PathAnalyzer(hideOriginalNode, this.builder, null, null).createPathList();
		for (let i=hidePathSelectors.length-1; i>=0; i--) {
			var hidePathSelector = hidePathSelectors[i];
			if (CustomBlockerUtil.arrayContains(this.addedHidePaths, hidePathSelector.path)) {
				continue;
			}
			this.addedHidePaths.push(hidePathSelector.path);
			
			var hideElements = hidePathSelector.elements;
			var siblingFound = false;
			for (var hideIndex=0; hideIndex<hideElements.length; hideIndex++) {
				if (hideElements[hideIndex]!=hideOriginalNode && hideElements[hideIndex].parentNode==hideOriginalNode.parentNode) {
					siblingFound = true;
				}		
			}
			
			if (hideElements.length>1 && siblingFound)  {
				var searchOriginalNode = originalNode;
				while (CustomBlockerUtil.isContained(searchOriginalNode, hideOriginalNode)) {
					var searchPathSelectors = new PathAnalyzer(searchOriginalNode, this.builder, hideOriginalNode, hidePathSelector.path).createPathList();
					for (let searchIndex=0; searchIndex<searchPathSelectors.length; searchIndex++) {
						var searchPathSelector = searchPathSelectors[searchIndex];
						if (CustomBlockerUtil.arrayContains(this.addedSearchPaths, searchPathSelector.path)) {
							continue;
						}
						if (this.isIncludedInAppliedRules(hidePathSelector, searchPathSelector)) {
							continue;
						}
						this.addedSearchPaths.push(searchPathSelector.path);
						let searchSelectedNodes = searchPathSelector.elements;
						let searchElements = searchPathSelector.elements;
						let containedNode = CustomBlockerUtil.getContainedElements(hideElements, searchElements);
						if (containedNode.length>1) {
						
							pathList.push(new SmartPath(hidePathSelector, searchPathSelector));
						}
					}
					searchOriginalNode = <HTMLElement>searchOriginalNode.parentNode;
				}
			}		
		}
	}
	isIncludedInAppliedRules (hidePathSelector:PathFilter, searchPathSelector:PathFilter): boolean {
		if (!this.appliedRuleList) {
			return false;
		}
		for (let rule of this.appliedRuleList) {
			if (
				CustomBlockerUtil.arrayEquals(hidePathSelector.elements, rule.hideNodes) && 
				CustomBlockerUtil.arrayEquals(searchPathSelector.elements, rule.searchNodes)
			) {
				return true;
			}
		}
		return false;
	}
 }
var pathCount  = 0;
class SmartPath {
	hidePath:PathFilter;
	searchPath:PathFilter;
	title:string;
	constructor (hidePath:PathFilter, searchPath:PathFilter) {
		this.hidePath = hidePath;
		this.searchPath = searchPath;
	}
}