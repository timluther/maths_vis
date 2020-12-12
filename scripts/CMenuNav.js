
function getNavMenuObject(elem) {
	var mc = elem.closest("#menucontainer");
	return (mc.length > 0) ? mc[0].navMenuObject : null;
}

function navMenuClick(event) {
	var nmo = getNavMenuObject($(event.target));
	if (nmo)
		nmo.onNavClick(event);
}

function breadcrumbBarClick(event) {
	var bcbo = getNavMenuObject($(event.target));
	if (bcbo)
		bcbo.onBreadCrumbBarClick(event);
}

function findDataItemIn_inner(list, valuesFromAddress, index, key,res)
{
	if (index >= valuesFromAddress.length)
		return res;
	var value = valuesFromAddress[index];

	//n.b. here you need to pass over parsing to this controller for this nav level
	if (!list)
	{
	    return res;
	}
	for (var j = 0; j < list.length; ++j) 
	{
		var original_list_value = list[j][key];
		var split_list_values = original_list_value.split("/");
		if (original_list_value == value) 
		{
			res.push(j);
			return findDataItemIn_inner(list[j].submenus, valuesFromAddress, index + 1, key, res);
			//return (index += 1 + split_list_values.length);
		}
		else if (split_list_values.length > 1) 
		{
			var lindex = index;
			var found = true;
			for (var k = 0; k < split_list_values.length; ++k, lindex++)
			{
				if (split_list_values[k] != valuesFromAddress[lindex])
				{
					found = false;
					break;
				}
			}			
			if (found)
			{
				res.push(j);
				index = lindex;	
				return findDataItemIn_inner(list[j].submenus, valuesFromAddress, index, key, res);
			}
    	}		
	}
	return -1;
}

export function getBreadCrumbsFromItems(list, valuesFromAddress, index, key) 
{
  var res = [];
  findDataItemIn_inner(list, valuesFromAddress, index, key, res);  
  if (list.length > res.length)
  {
	  for (var i = list.length; i < res.length; ++i)
	  {

	  }
  }
  return res;
}

export class CMenuNav {
	constructor() {
		this.mainContainer = $("#menucontainer");
		this.navbar = this.mainContainer.find("#navbuttonscontainer ul");
		this.breadCrumbContainer = $("#breadcrumbcontainer");
		this.breadCrumbBar = this.breadCrumbContainer.find("ul");
		if (this.mainContainer && this.mainContainer.length > 0) {
			this.mainContainer[0].navMenuObject = this;
			this.navbar[0].navMenuObject = this;
		}
		this.currentLevel = null;
		this.dataRoot = null;
		this.breadCrumbs = [];
		//module scoping work around
		window.navMenuClick = navMenuClick;
		window.breadcrumbBarClick = breadcrumbBarClick;
	}

	setData(data, navCallBack) {
		this.breadCrumbs = [];
		this.buildMenus(data, null);
		this.buildBreadCrumbUI();
		this.currentLevel = data;        
		this.rootLevel = data;
		this.navCallBack = navCallBack;
	}

	doNavCallback(onComplete)
	{
		if (this.navCallBack)
		{            
			this.navCallBack(this.breadCrumbs, onComplete);
		}
	}

	navUp() {
		if (this.breadCrumbs.length > 0) {
			this.currentLevel = this.breadCrumbs.pop().data;
			this.buildMenus(this.currentLevel);
			this.buildBreadCrumbUI();
		}
	}

	//breadcrumbs aren't lists - they contain their href and the list they are in, which can be used to navigate
	determineBreadcrumbIndexInList(breadCrumb) 
	{
		var href = breadCrumb.href;
		for (var i = 0; i < breadCrumb.data.length; ++i) {
			var item = breadCrumb.data[i];
			if (item.href == href )
				return i;

		}
		return i;
	}

	getBreadcrumbChildList(breadCrumb) 
	{
		var idx = this.determineBreadcrumbIndexInList(breadCrumb);
		if (idx != -1)
		{
			return breadCrumb.data[idx].submenus;
		}
		return null;
	}

	addDynamicBreadcrumb(name, initfunc, data)
	{
		var item = { name: name, href: name, initfunc: initfunc, data: data, dynamic:true };
		this.breadCrumbs.push(item);
		this.currentLevel = item;
		this.buildMenus(this.currentLevel);
		this.buildBreadCrumbUI();
		this.doNavCallback(false); //explicitly false callback function - means main pane won't be updated
	}

	pushBreadCrumb(item, data) {
		this.breadCrumbs.push({ name: item['text'], href: item['href'], initfunc: item['initfunc'], data: data, item:item});
	}
	/*Sets the nav level using a qualified sub address (e.g.'Zenic/portal/admin/contracts/'), builds up the breadcrumbs history from that and then builds the UI to reflect this*/
	//TODO: doesn't work perfectly yet, fix this

	navigateListAndPerformCallback(breadCrumbIndices,breadCrumbIndex, itemList)
	{
		if (itemList != null)
		{
			var item = itemList[breadCrumbIndices[breadCrumbIndex]];
			if (item)
			{
				var clist = item['submenus'];			
				this.pushBreadCrumb(item, itemList);	
				var thisMenuObj = this;
				if (item.initfunc)
				{
				    window[item.initfunc](function()
				    {
				        if (breadCrumbIndex < breadCrumbIndices.length)				        			
					        thisMenuObj.navigateListAndPerformCallback(breadCrumbIndices, breadCrumbIndex + 1, clist);
				        			
				    });
				}else
				{
    				if (breadCrumbIndex < breadCrumbIndices.length)				        			
					        this.navigateListAndPerformCallback(breadCrumbIndices, breadCrumbIndex + 1, clist);
				}
			}
		}
		else
		{
			var a = 10;
		}
	}

	setLevelDirectly(navlist)
	{        
		var items = navlist.trim().split("/");
		if (items[0] == '' )
			items = items.slice(1);
		if (items[items.length - 1] == '')
			items = items.slice(0,-1);
		this.breadCrumbs = [];
		if (this.rootLevel)
		{

			var breadCrumbList = getBreadCrumbsFromItems(this.rootLevel, items, 0, "href");			
			if (breadCrumbList.length > 0)
			{			
				this.navigateListAndPerformCallback(breadCrumbList, 0, this.rootLevel);
			}

			if (this.breadCrumbs.length > 0)
				this.currentLevel = this.getBreadcrumbChildList(this.breadCrumbs[this.breadCrumbs.length - 1]);
			else
				this.currentLevel = this.rootLevel;
			this.buildMenus(this.currentLevel);
			this.buildBreadCrumbUI();
		}
		return true;
	}

	navDown(index) {
		var item = this.currentLevel[index];
		var submenus = item["submenus"];
		if (submenus) {
			this.pushBreadCrumb(item, this.currentLevel);
			
			this.currentLevel = submenus;
			this.buildMenus(submenus);
			this.buildBreadCrumbUI();
		}
		else {
			this.pushBreadCrumb(item, this.currentLevel);            
			this.currentLevel = null;
			this.buildMenus(null);
			this.buildBreadCrumbUI();
		}
	}

	onBreadCrumbBarClick(event)
	{
		var index = $(event.target).closest("li").index();
		if (index < this.breadCrumbs.length) 
		{
			var diff = this.breadCrumbs.length - index;
			for (var i = 0; i < diff;++i)
			{
				this.currentLevel = this.breadCrumbs.pop().data;                
			}
			this.buildMenus(this.currentLevel);
			this.buildBreadCrumbUI();
			this.doNavCallback();
		}
	}

	onNavClick(event) {        
		var index = $(event.target).closest("li").index();
		if (this.breadCrumbs.length == 0) 
		{
			this.navDown(index);            
		}
		else {
			if (index == 0)
			
				this.navUp();

			else
				this.navDown(index - 1);
		}
		this.doNavCallback();
	}

	buildBreadCrumbUI(breadCrumbs) {
		/*<div id="">
			<ul class="list-inline bread_crumbs_con</ul>tainer">*/
		if (!breadCrumbs)
			breadCrumbs = this.breadCrumbs;
		this.breadCrumbBar.empty();
		var itemDiv = `<li class="list-inline-item">
				<span class="bread_crumbs" onClick="window.breadcrumbBarClick(event)">Home</span>
			</li>`;
		this.breadCrumbBar.append(itemDiv);
		if (this.breadCrumbs.length > 0) {
			for (var i = 0; i <breadCrumbs.length; ++i) {
				var bc = breadCrumbs[i];
				var name = "";
				if (typeof bc === 'string')
					name = bc;
				else
					name = bc["name"];

				var itemDiv = `<li class="list-inline-item">
				<span class="bread_crumbs" onClick="window.breadcrumbBarClick(event)">${name}</span>
			</li>`;
				this.breadCrumbBar.append(itemDiv);
			}
		}
	}

	buildMenus(data) {
		this.navbar.empty();
		if (this.breadCrumbs.length > 0) {
			var itemDiv = `<li onclick="window.navMenuClick(event);" >			    
					<span>⮬</span>
				</li`;
		}
		this.navbar.append(itemDiv);
		if (data) {
			for (var i = 0; i < data.length; ++i) {
				var item = data[i];
				var iconDef = item.icon ? `<span><img class='editIcon' src="/ZenSystem/View/Templates/default/icns/${item.icon}" /></span>` : "";

				var itemDiv = `<li onclick="${item.onclick};window.navMenuClick(event);" >
					${iconDef}
					<span>${item.text}</span>
				</li`;
				this.navbar.append(itemDiv);
			}
		}
	}
}
