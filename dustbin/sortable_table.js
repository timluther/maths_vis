/*
var container = $(".scrollable_data_list #list");
	for (var key in dataFlows) 
	{
		var df = dataFlows[key];
		var rowdata=
		`<tr><td>${df.header["Flow Reference"]} </td> <td> ${df.header["Flow Name"]} </td> <td>${df.header["Flow Ownership"]} </td></tr>`;
		container.append(rowdata);
	}*/

function BasicList()
{
	this.mColumnNames = [];
	this.mData = [];

	this.getColumnCount = function()
	{
		return this.mColumnNames.length;
	}
	this.getRowCount = function()
	{
		return this.mData.length;
	}

	this.getData = function(column, row)
	{
		var rowData = this.mData[this.keyIndices[row]];
		return rowData[column];
	}

	this.hasHoverPopup = function(column, row)
	{
		return 0;
	}
}


function tableHeaderClick(e)
{
	var td = $(e.target);
	var tablejq = td.closest("table");
	var table = tablejq[0]['table'];

	var newSortColumn = td.index();
	if (newSortColumn == table.sortColumn)
		table.sortDirection ^= 1;
	else
		table.sortColumn = newSortColumn;
	
	table.processSort();
	table.insertHTMLRows();    
}

//hack due to no parameters to preciates
var gCurrSortTable = null;

function sortableTable(list, jqTable, includeRegExFilters = true)
{
	this.sortColumn = 0;
	this.sortDirection = 0;
	this.sortIndices = null;
	this.selectedRow = -1;
	this.jqTable = jqTable;
	this.jqTable[0]['table'] = this;
	this.includeRegExFilters = includeRegExFilters;
	this.regexFilters = [];
	this.columnNameToIndex = {};
	this.regexFlags = 0;
	
	
	var head = jqTable.find("thead");
	var headcells = head.find("td");

   	this.getRowOffset = function()
   	{
   		return 1 + (this.includeRegExFilters ? 1 : 0);
   	}

   	this.getDataColumnIndex = function(columnName)
   	{
   		if (this.columnNameToIndex.hasOwnProperty(columnName))
   		 	return this.columnNameToIndex[columnName];
   		else
   			return -1;
   	}

   	this.setFilter = function(columnName, filter)
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


   	this.rowOffsetToItemIndex = function(idx)
   	{
   		if (this.sortIndices)
   			return this.sortIndices[idx];
   		else
   			return idx;
   	}
	
	this.processSort = function()
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
			table = gCurrSortTable;
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

	this.insertHTMLRows = function()
	{
		if ((this.list != null) && (this.jqTable != null))
		{
			this.jqTable.empty();
			var rowString = '<thead>';
			var colCount = this.list.getColumnCount();
			colClasses = [];
			for (var j = 0; j < colCount; ++j)
			{
				data = this.list.getColumnName(j);
				sortColumnArrow = (j == this.sortColumn)? (this.sortDirection)?'▼':'▲' : '';
				rowString += `<td onclick="tableHeaderClick(event)">${data}<span class="sortArrow">${sortColumnArrow}</span></td>`;

				colClasses.push((this.list.hasHoverPopup(0,j) != 0) ? "hasPopup" : "noPopup");
				
			}


			rowString += '</thead>';
			this.jqTable.append(rowString);

			if (this.includeRegExFilters)
			{
				var rowString = '<thead>';
				for (var j = 0; j < colCount; ++j)
				{
					var regEx = this.regexFilters[j]
					var regExStr = regEx ? regEx.toString().slice(1, -1) : "";
			
					name = this.list.getColumnName(j);
					rowString += `<td><img src="icns/filter.svg" height="100%"> <input name="filter_${name}" onChange="tableFilterChanged(event)" value="${regExStr}"> </td>`;			
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
					var hoverMode = this.list.hasHoverPopup(j,i);
					if (hoverMode == POPMODE_CLICK)
					{
						rowString += `<td class='${colClasses[j]}' onClick='setPopupContentsFromDiv(event)'>${data}</td>`;
					}
					else if (hoverMode == POPMODE_HOVER) 
					{
						rowString += `<td class='${colClasses[j]}' onMouseEnter='setHoverPopupContentsFromDiv(event)' onMouseMove='setHoverPopupContentsFromDiv(event)'>${data}</td>`;	
					}
					else
					{
						rowString += `<td class='${colClasses[j]}'>${data}</td>`;	
					}

				}
				rowString +=  '</tr>'
				this.jqTable.append(rowString);
			}
		}        
	}

	
	this.setList = function(list)
	{
		this.list = list;
		this.regexFlags = 0;
		this.regexFilters = [];
		var colCount = this.list.getColumnCount();
		for (var i = 0; i < colCount; ++i)
		{
			this.regexFilters.push(null);
			this.columnNameToIndex[this.list.getColumnName(i)] = i;
		}
		this.insertHTMLRows();
	}
	this.setList(list);


	return this;
}