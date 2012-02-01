
try {
	CustomBlockerUtil.localize();
} catch (ex) {
	document.write(ex);
	return;
}
var peer = RulePeer.getInstance();
function openRuleEditor()
{
	var bgWindow = chrome.extension.getBackgroundPage();
	bgWindow.openRulePicker();
	window.close();
}

function getAppliedRules()
{
	try {
	CustomBlockerUtil.localize();
	} catch (ex) {
		document.write(ex);
		return;
	}
	refreshButton();
	
	var bgWindow = chrome.extension.getBackgroundPage();
	
	bgWindow.getAppliedRules(function(list)
	{
		try 
		{
			renderApplierRules(list);
		} 
		catch (ex) {
		}
	});
	
}
function setBlockOn (on) 
{
	localStorage.blockDisabled = (on)?'false':'true';
	var bgWindow = chrome.extension.getBackgroundPage();
	bgWindow.setIconDisabled(!on);
	refreshButton();
}
function refreshButton () 
{
		var isDisabled = ('true' == localStorage.blockDisabled);
		document.getElementById('buttonOn').checked = !isDisabled;
		document.getElementById('buttonOff').checked = isDisabled;
}
function renderApplierRules(list)
{
	var ul = document.getElementById('activeRules');
	if (list && list.length > 0) 
	{
		for (var i = 0, l = list.length; i < l; i++) 
		{
			var rule = list[i];
			var li = document.createElement('LI');
			
			var divTitle = document.createElement('DIV');
			divTitle.className = 'title';
			divTitle.innerHTML = CustomBlockerUtil.shorten(CustomBlockerUtil.escapeHTML(rule.title), 24);
			var divCount = document.createElement('DIV');
			divCount.className = 'count ' + ((rule.hiddenCount && rule.hiddenCount>0)?'hit':'noHit');
			divCount.innerHTML = (rule.hiddenCount)?rule.hiddenCount:0;
			
			var buttonContainer = document.createElement('SPAN');
			buttonContainer.className = 'buttonContainer';
			
			var editButton = document.createElement('INPUT');
			editButton.type = 'BUTTON';
			editButton.className = 'buttonEdit';
			editButton.addEventListener('click', getEditRuleAction(rule), true);
			editButton.value = chrome.i18n.getMessage('buttonLabelEdit');
			
			
			var disableButton = document.createElement('input');
			disableButton.type = 'BUTTON';
			disableButton.value = (rule.is_disabled)?'OFF':'ON';
			disableButton.className = (rule.is_disabled)?'buttonOff':'buttonOn';
			disableButton.addEventListener ('click', getDisableAction(rule,disableButton), false);
			
			buttonContainer.appendChild(disableButton);
			buttonContainer.appendChild(editButton);
			li.appendChild(buttonContainer);
			li.appendChild(divCount);
			li.appendChild(divTitle);
			ul.appendChild(li);
		}
	}
	else {
		var emptyLi = document.createElement('LI');
		emptyLi.innerHTML = 'None';
		ul.appendChild(emptyLi);
	}
}

function getEditRuleAction(rule)
{
	return function()
	{
		var bgWindow = chrome.extension.getBackgroundPage();
		bgWindow.openRulePicker(rule);
		window.close();
	}
}

function openPreference()
{
	window.open('pref/index.html');
}
function getDisableAction (rule, disableButton)
{
	return function (event)
	{
		rule.is_disabled = !rule.is_disabled;
		disableButton.value = (rule.is_disabled)?'OFF':'ON';
		disableButton.className = (rule.is_disabled)?'buttonOff':'buttonOn';
		try 
		{
			peer.saveObject(rule, function () 
			{
				var bgWindow = chrome.extension.getBackgroundPage();
				bgWindow.reloadLists();
			});
		}
		catch (ex)
		{
			document.write(ex);
		}
	}
}