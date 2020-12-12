
const POPMODE_NONE = 0;
const POPMODE_CLICK = 1;
const POPMODE_HOVER = 2;
const POPMODE_DONOTHING = 3; // use this one if items handle their own mouse events with injected html


function getTableObjectFromChildElement(elem) {
	var table = $(elem).closest('table');
	if (table.length > 0) {
		return table[0]['table'];
	}
	return null;
}

function tableFilterChanged(event) {
	var target = event.target;
	var value = target.value;
	var name = target.name;
	var name_elems = name.split("_");
	var table = getTableObjectFromChildElement(target);
	table.setFilter(name_elems[1], value);
	console.log(event);
}

function extractContent(html) {
	return (new DOMParser).parseFromString(html, "text/html").documentElement.textContent;
}


export class BasicList
{
	constructor()
	{
		this.mColumnNames = [];
		this.mData = [];	
	}
	
	getColumnCount()
	{
		return this.mColumnNames.length;
	}
	getRowCount()
	{
		return this.mData.length;
	}

	getData(column, row)
	{
		var rowData = this.mData[this.keyIndices[row]];
		return rowData[column];
	}

	hasHoverPopup(column, row)
	{
		return 0;
	}

	getClickFunction(column, row)
	{
		return "";
	}

	getHoverPopup (column, row) 
	{
		return "";
	}
}
 

function tableHeaderClick(e)
{
	var td = $(e.target);
	var tablejq = td.closest("table");
	if (tablejq.length > 0)
	{
		var table = tablejq[0]['table'];
		var newSortColumn = td.index();
		if (newSortColumn == table.sortColumn)
			table.sortDirection ^= 1;
		else
			table.sortColumn = newSortColumn;
	
		table.processSort();
		table.insertHTMLRows();    
	}
}

//hack due to no parameters to preciates
var gCurrSortTable = null;
 

export default class CSortableTable
{
	constructor(list, jqTable, includeRegExFilters = true)
	{ 
		this.sortColumn = 0;
		this.sortDirection = 0;
		this.sortIndices = null;
		this.selectedRow = -1;
		this.jqTable = jqTable;
		if (this.jqTable.length > 0)
		    this.jqTable[0]['table'] = this;
		else
		    console.log("No jqTable object found on CSortableTable");
		this.includeRegExFilters = includeRegExFilters;
		this.regexFilters = [];
		this.columnNameToIndex = {};
		this.regexFlags = 0;		
		this.setList(list);
		document.tableHeaderClick = tableHeaderClick;
	}	
	

	getRowJQObject(idx)
	{
		return this.jqTable.children().eq(idx);
	}

	//Page parameter interface///////////////
	parseStateParams(commands)
	{
		var obj = this;
		commands.searchParams.forEach(function(value, key) 
		{
  			console.log(value, key);
  			var idx = obj.getColumnIndex(key);
  			if (idx != -1)
  			{
  				var rowIdx = obj.findEntry(idx, value);
  				if (rowIdx != -1)
  				{
  					var row = obj.getRowJQObject(rowIdx + 2);
  					var scrollContainer = row.parent().parent();
					var yoffset = row.offset().top;
					var halfHeight = scrollContainer.height() * 0.5;
  					//scrollContainer.scrollTop();
  					scrollContainer.animate({ scrollTop: yoffset- halfHeight }, 1000, function()
  					{
  						setPopupContentsFromDivElement(row, 0);	
  					});
  					
  				}
  			}

		});				
	}

	findEntry(column, entry)
	{
		entry = entry.toString().toLowerCase();
		var rc = this.list.getRowCount();
		for (var i = 0; i < rc; ++i)
		{
			var value = this.list.getData(column, i).toString().toLowerCase();
			if (value == entry)
			{
				return i;
			}
		}
		return -1;
	}

	getColumnIndex(columnName)
	{
		for (var i = 0; i < this.list.getColumnCount(); ++i)
		{
			var colName = this.list.getColumnName(i);
			if (colName == columnName)
				return i;
		}
		return -1;
	}

	getCurrentStateParams()
	{
		return "";
	}
	//search interface
	searchForTerm(searchTerm, limits)
	{
		var results = [];
		var columnMask = 0xFFFFFFFF;
		if (limits.hasOwnProperty('columnMask'))			
		{
			columnMask = limits['columnMask'];			
		}

		re = new RegExp(searchTerm);
		var rowCount =  this.list.getRowCount();
		var colCount =  this.list.getColumnCount();
		
		for (var i = 0 ; i < rowCount; ++i)
		{
			var columnFound = 0;
			for (var c = 0; c < colCount; ++c)
			{								
				var value = this.list.getData(c, i);
				if (re.exec(value))
				{
					columnFound |= 1 << c;
				}
								
			}
			if (columnFound)
			{
				var flowName = this.list.getData(0,i);
				var description = this.list.getData(1,i);
				results.push({Name:flowName,Type:'flow reference',link:`dataflow_list?flowid={flowName}`,Description:description} );
			}
			
		}
		return results;

	}

	//////////////////////////////////////////

   	getRowOffset()
   	{
   		return 1 + (this.includeRegExFilters ? 1 : 0);
   	}

   	getDataColumnIndex(columnName)
   	{
   		if (this.columnNameToIndex.hasOwnProperty(columnName))
   		 	return this.columnNameToIndex[columnName];
   		else
   			return -1;
   	}

   	onListChange(list, startidx, endidx)
   	{
		//TODO: interpret parameters
		if (Array.isArray(startidx))
		{
			//in this case have an array of affected rows
		}
		else
		{
			//otherwise, a range from 'startidx' to 'endidx'
		}
		this.processSort();		   
   		this.insertHTMLRows();
   	}

   	setFilter(columnName, filter)
   	{
   		var colIdx = this.getDataColumnIndex(columnName);
   		if (colIdx == -1)
   			return;
   		var re = null;
   		try
		{
			re = filter == "" ? null : new RegExp(filter);
			if (re != null)
				this.regexFlags |= (1 << colIdx);
		}
		catch(err)
		{
			console.log(err);
		}

   		this.regexFilters[colIdx] = re;
   		this.processSort();
   		this.insertHTMLRows();
   	}


   	rowOffsetToItemIndex(idx)
   	{
   		if (this.sortIndices)
   			return this.sortIndices[idx];
   		else
   			return idx;
   	}
	
	processSort()
	{        
		var colCount = this.list.getColumnCount();
		this.sortIndices = [];
		{		

			var rowCount =  this.list.getRowCount();
			for (var i = 0 ; i < rowCount; ++i)
			{
				if (this.regexFlags != 0)  //any regular expressions?
				{
					var matched = true;
					for (var c = 0; c < colCount; ++c)
					{
						var regEx = this.regexFilters[c];
						if (regEx)
						{
							var regexStr = regEx.toString();
							var value = this.list.getData(c, i);
							if (!regEx.exec(value))
							{
								var popupHTML = this.list.getHoverPopup(c, i);
								var popupContent = extractContent(popupHTML);
								if (!regEx.exec(popupContent))
								{
									matched = false;
									break;
								}	
							}
						}
					}
					if (matched)
						this.sortIndices.push(i);	
				}
				else
					this.sortIndices.push(i);
			}
		}

		gCurrSortTable = this;
		this.sortIndices.sort(function(a,b)
		{
			var table = gCurrSortTable;
			var sortDir = table.sortDirection == 0? -1 : 1;
			var dataA = table.list.getData(table.sortColumn, a);
			var dataB = table.list.getData(table.sortColumn, b);
			if (dataA < dataB)
				return sortDir * -1;
			else if (dataA > dataB)
				return sortDir;
			else
				return 0;
		})
	}

	/*var re = 0;

			try
			{
				re = new RegExp(regex);
			}
			catch(err)
			{
				console.log(err);
				re = new RegExp(".*");
			}*/

	insertHTMLRows()
	{
		if ((this.list != null) && (this.jqTable != null))
		{
			this.jqTable.empty();
			var rowString = '<thead>';
			var colCount = this.list.getColumnCount();
			var colClasses = [];
			for (var j = 0; j < colCount; ++j)
			{
				var data = this.list.getColumnName(j);
				var sortColumnArrow = (j == this.sortColumn)? (this.sortDirection)?'▼':'▲' : '';
				rowString += `<td onclick="document.tableHeaderClick(event)">${data}<span class="sortArrow">${sortColumnArrow}</span></td>`;
				colClasses.push((this.list.hasHoverPopup(0,j) != 0) ? "hasPopup" : "noPopup");				
			}

			rowString += '</thead>';
			this.jqTable.append(rowString);
			var icondir = "/ZenSystem/View/Templates/default/icns/"
			if (this.includeRegExFilters)
			{
				var rowString = '<thead>';
				for (var j = 0; j < colCount; ++j)
				{
					var regEx = this.regexFilters[j]
					var regExStr = regEx ? regEx.toString().slice(1, -1) : "";
			
					name = this.list.getColumnName(j);
					rowString += `<td><img src="${icondir}filter.svg" height="100%"> <input name="filter_${name}" onChange="tableFilterChanged(event)" value="${regExStr}"> </td>`;			
				}
				rowString += '</thead>';
				this.jqTable.append(rowString);
			}

			var rowCount = (this.sortIndices) ? this.sortIndices.length : this.list.getRowCount();
			
		   
			for (var i = 0; i < rowCount;++i)
			{                
				rowString = this.selectedRow ? '<tr class="selected">' :'<tr>';
				var row = (this.sortIndices)?this.sortIndices[i]:i;
				for (var j = 0; j < colCount; ++j)
				{
					
					data = this.list.getData(j, row);
					if (Array.isArray(data))
					{						
						data = data.toString();
					}
					else if (typeof data === 'object' && data !== null)
					{
						data = JSON.stringify(data);
					}					
					
					var hoverMode = this.list.hasHoverPopup(j,i);

					var clickFunction = "";
					var clickClass = "";

					if (typeof this.list.getClickFunction == 'function')
					{
						var clickFunction = this.list.getClickFunction(j,row);
						if (clickFunction != "")
						{
							clickClass = "clickableItem";
						}
					}

					if (hoverMode == POPMODE_CLICK)
					{
						rowString += `<td class='${colClasses[j]} ${clickClass}' onClick='setPopupContentsFromDiv(event);${clickFunction}>${data}</td>`;
					}
					else if (hoverMode == POPMODE_HOVER) 
					{
						rowString += `<td class='${colClasses[j]} ${clickClass}' onClick='${clickFunction}' onMouseEnter='setHoverPopupContentsFromDiv(event)' onMouseMove='setHoverPopupContentsFromDiv(event)'>${data}</td>`;	
					}
					else if (hoverMode == POPMODE_DONOTHING)
					{
						rowString += `<td class='${colClasses[j]} ${clickClass}'>${data}</td>`;	
					}
					else
					{
						rowString += `<td class='${colClasses[j]} ${clickClass}' onClick='${clickFunction}'>${data}</td>`;	
					}



				}
				rowString +=  '</tr>'
				this.jqTable.append(rowString);
			}
		}        
	}

	
	setList(list)
	{
		if (list && (typeof list.addListener === 'function'))
		{
			list.addListener(this);
		}
		this.list = list;
		this.regexFlags = 0;
		this.regexFilters = [];
		if (this.list == null)
		{
			return;
		}
		var colCount = this.list.getColumnCount();
		for (var i = 0; i < colCount; ++i)
		{
			this.regexFilters.push(null);
			this.columnNameToIndex[this.list.getColumnName(i)] = i;
		}
		this.insertHTMLRows();
	}
}