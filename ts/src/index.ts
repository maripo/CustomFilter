class Popup {
	prevHoverRule:Rule;
	constructor() {
		this.prevHoverRule = null;
	}
	openRuleEditor() {
		this.removeHighlight();
		let bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.openRulePicker(null);
		window.close();
	}
	highlightRuleElements (rule:Rule) {
		let bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.highlightRuleElements(rule);
	}
	getAppliedRules() {
		try {
			CustomBlockerUtil.processPage();
		} catch (ex) {
			document.write(ex);
			return;
		}
		this.refreshButton();

		let bgWindow = chrome.extension.getBackgroundPage();
		let scope = this;
		bgWindow.getAppliedRules(function(list:Rule[]) {
			try {
				scope.renderApplierRules(list);
			}
			catch (ex) {
			}
		});
	}
	setBlockOn (on: boolean) {
		localStorage.blockDisabled = (on)?'false':'true';
		let bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.setIconDisabled(!on);
		this.refreshButton();
	}
	refreshButton () {
			let isDisabled = ('true' == localStorage.blockDisabled);
			(document.getElementById('buttonOn') as HTMLInputElement).checked = !isDisabled;
			(document.getElementById('buttonOff') as HTMLInputElement).checked = isDisabled;
	}
	getLiMouseoverAction (rule:Rule) {
		let scope = this;
		return function()
		{
			if (scope.prevHoverRule==rule) return;
			scope.prevHoverRule = rule;
			scope.highlightRuleElements(rule)
		};
	}
	removeHighlight () {
		if (this.prevHoverRule!=null) {
			this.prevHoverRule = null;
			let bgWindow = chrome.extension.getBackgroundPage();
			bgWindow.highlightRuleElements(null);
		}
	}
	renderApplierRules(list: Rule[]) {
		let ul = document.getElementById('activeRules');
		let scope = this;
		ul.addEventListener ('mouseout',
				function(){scope.removeHighlight()},
				false);
		if (list!=null && list.length > 0)  {
			for (let i = 0, l = list.length; i < l; i++)  {
				let rule = list[i];
				let li = document.createElement('LI');
				let tip = CustomBlockerUtil.getRuleDetailTip(rule);
				if (tip) {
					li.title = tip;
				}
				li.addEventListener ('mouseover',
						this.getLiMouseoverAction(rule), true);

				let divTitle = document.createElement('DIV');
				divTitle.className = 'title';
				divTitle.innerHTML = CustomBlockerUtil.shorten(rule.title, 42);
				let divCount = document.createElement('DIV');
				divCount.className = 'count ' + ((rule.hiddenCount && rule.hiddenCount>0)?'hit':'noHit');
				divCount.innerHTML = (rule.hiddenCount)?rule.hiddenCount.toString():'0';

				let buttonContainer = document.createElement('SPAN');
				buttonContainer.className = 'button-container';

				let editButton = document.createElement('INPUT') as HTMLInputElement;
				editButton.type = 'BUTTON';
				editButton.className = 'buttonEdit';
				editButton.addEventListener('click', this.getEditRuleAction(rule), true);
				editButton.value = chrome.i18n.getMessage('buttonLabelEdit');


				let disableButton = document.createElement('input') as HTMLInputElement;
				disableButton.type = 'BUTTON';
				disableButton.value = (rule.is_disabled)?'OFF':'ON';
				disableButton.className = (rule.is_disabled)?'buttonOff':'buttonOn';
				disableButton.addEventListener ('click', this.getDisableAction(rule,disableButton), false);

				buttonContainer.appendChild(editButton);
				buttonContainer.appendChild(disableButton);
				li.appendChild(buttonContainer);
				li.appendChild(divCount);
				li.appendChild(divTitle);
				ul.appendChild(li);
			}
		}
		else
		{
			let emptyLi = document.createElement('LI');
			emptyLi.className = 'empty';
			emptyLi.innerHTML = 'None';
			ul.appendChild(emptyLi);
		}
	}
	getEditRuleAction(rule:Rule) {
		let scope = this;
		return function () {
			scope.removeHighlight();
			let bgWindow = chrome.extension.getBackgroundPage();
			bgWindow.openRulePicker(rule);
			window.close();
		}
	}
	getDisableAction (rule:Rule, disableButton:HTMLInputElement) {
		return function (event) {
  			cbStorage.toggleRule(rule, function() {
				disableButton.value = (rule.is_disabled)?'OFF':'ON';
				disableButton.className = (rule.is_disabled)?'buttonOff':'buttonOn';
  			});
		}
	}
}

window.onload = function () {
	let popup = new Popup();
	popup.getAppliedRules();
	document.getElementById('versionLabel').innerHTML = chrome.runtime.getManifest().version;
	document.getElementById('buttonOn').addEventListener ('click',
			function(){ popup.setBlockOn(true); }, false);
	document.getElementById('buttonOff').addEventListener ('click',
			function(){ popup.setBlockOn(false); }, false);
	document.getElementById('buttonOpenPreferenceTop').addEventListener('click',
			function openPreference (){window.open('pref/index.html?p=i1');},
			false);
	document.getElementById('buttonCreateRule').addEventListener('click', function(){popup.openRuleEditor()}, false);
}
