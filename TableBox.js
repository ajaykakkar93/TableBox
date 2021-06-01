define(["qlik", "qvangular", "jquery", "./prop", "css!./style.css", "./tableHeadFixer", "./d3.v3.min"], function(qlik, qv,$, prop) {
	'use strict';
	var tableToExcel = (function() {
		// Define your style class template.
		var style = "<style></style>";
		var uri = 'data:application/vnd.ms-excel;base64,',
			template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' + style + '</head><body><table>{table}</table></body></html>',
			base64 = function(s) {
				return window.btoa(unescape(encodeURIComponent(s)))
			},
			format = function(s, c) {
				return s.replace(/{(\w+)}/g, function(m, p) {
					return c[p];
				})
			}
		return function(table, name) {
			if (!table.nodeType) table = document.getElementById(table)
			var ctx = {
				worksheet: name || 'Worksheet',
				table: table.innerHTML
			}
			window.location.href = uri + base64(format(template, ctx))
		}
	})()
	var ColGrp = '',
		excludedDim = 0,
		excludedMes = 0;

	function checkValue(value, arr) {
		var status = -1;
		for (var i = 0; i < arr.length; i++) {
			var name = arr[i].name;
			if (name == value) {
				status = i;
				break;
			}
		}
		return status;
	}
	/**
	 * Set column to be first in sort order
	 * @param self The extension
	 * @param col Column number, starting with 0
	 */
	function setSortOrder(self, col) {
		//set this column first
		var sortorder = [col];
		//append the other columns in the same order
		self.backendApi.model.layout.qHyperCube.qEffectiveInterColumnSortOrder.forEach(function(val) {
			if (val !== sortorder[0]) {
				sortorder.push(val);
			}
		});
		self.backendApi.applyPatches([{
			'qPath': '/qHyperCubeDef/qInterColumnSortOrder',
			'qOp': 'replace',
			'qValue': '[' + sortorder.join(',') + ']'
		}], true);
	}
	/* run through and sum, subtotal and total in the cols */
	function formatNumber(num) {
		return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
	}

	function gen_sums(table_id, format, xtraCalc, xtraCalcStr) {
		var rows = $("#" + table_id + " tr");
		var x_cols = [];
		var t_cols = [];
		var numre = /\d+\.?\d*/;
		format = format.split('|');
		var xtraCalc = xtraCalc.split('|'),
			xtraCalcStr = xtraCalcStr.split('|');
		// for every row
		for (var i = 0; i < rows.length; i++) {
			// see if we have sum cols
			var sum_cols = $("td.sum", $(rows[i]));
			// if no sum cols, check for subtotal cols
			if (sum_cols.length == 0) {
				var sub_cols = $("td.subtotal", $(rows[i]))
				// no subtotal cols either, then skip this as it is a header row
				if (sub_cols.length == 0) {
					continue;
				}
				// otherwise, lets go through and fill in the current column totals
				for (var j = 0; j < sub_cols.length; j++) {
					var fFormat = d3.format(format[j]);
					if (j >= x_cols.length) {
						break;
					}
					sub_cols[j].innerHTML = fFormat(eval(x_cols[j] + xtraCalc[j])) + (xtraCalcStr[j] == undefined ? '' : xtraCalcStr[j]);
					//sub_cols[j].innerHTML = formatNumber(x_cols[j].toFixed(decimal)*((format=='%,1' || format=='%,2')?100:1));
					t_cols[j] += x_cols[j]; // reset to 0 for subtotal
					x_cols[j] = 0;
				}
			}
			// 
			if (sum_cols.length > x_cols.length) {
				while (sum_cols.length > x_cols.length) {
					x_cols.push(0.0);
					t_cols.push(0.0);
				}
			}
			// if we Do have sum cols, add in the value
			for (var j = 0; j < sum_cols.length; j++) {
				//var v = sum_cols[j].innerHTML;
				var v = sum_cols[j].getAttribute("val");
				var m = numre.exec(v);
				if (m == null) {
					continue;
				}
				x_cols[j] += Number(m[0]);
			}
		}
		// and then fill in the total row
		var total_cols = $("#" + table_id + " tr.totals td.total");
		for (var i = 0; i < total_cols.length; i++) {
			if (i >= t_cols.length) {
				break;
			}
			total_cols[i].innerHTML = t_cols[i];
		}
	}
	/**
	 * Reverse sort order for column
	 * @param self The extension
	 * @param col The column number, starting with 0
	 */
	function reverseOrder(self, col, type) {
		var hypercube = self.backendApi.model.layout.qHyperCube;
		var dimcnt = hypercube.qDimensionInfo.length;
		var reversesort = (col < dimcnt ? hypercube.qDimensionInfo[col].qReverseSort : hypercube.qMeasureInfo[col - dimcnt].qReverseSort);
		self.backendApi.applyPatches([{
			'qPath': '/qHyperCubeDef/' + (col < dimcnt ? 'qDimensions/' + col : 'qMeasures/' + (col - dimcnt)) + '/qDef/qReverseSort',
			'qOp': 'replace',
			'qValue': (!reversesort).toString()
		}], true);
	}

	function createRows(rows, dimensionInfo, measureInfo, layout) {
		//debugger;
		var html = "",Rowcss=layout.Rowcss,
			measure = 0,
			wraptext = (layout.wraptext ? 'white-space: pre-wrap !important;' : ''),
			BorderColor = layout.BorderColor,
			CellPadding = layout.DataCellPadding;
		rows.forEach(function(row) {
			html += '<tr>';
			row.forEach(function(cell, key) {
				var txtcolor = (layout.DefaultDataStyle ? layout.DataColor : cell.qAttrExps.qValues["0"].qText),
					bgcolor = (layout.DefaultDataStyle ? layout.DataBgColor : cell.qAttrExps.qValues["1"].qText),
					align = (cell.qAttrExps.qValues["2"].qText == 1 ? 'left' : (cell.qAttrExps.qValues["2"].qText == 2 ? 'right' : 'center')),
					size = (layout.tdFontsizeshow ? layout.tdFontsize : cell.qAttrExps.qValues["3"].qText),
					addcss = (cell.qAttrExps.qValues["4"].qText == undefined ? '' : cell.qAttrExps.qValues["4"].qText),
					selectable = '',
					sheetNavigation = 'nosel',
					mesSel='',
					urlNavigation, hide = '',
					navType = 1,
					SubTotal = '';
				// wraptext to addcss
				addcss += wraptext;
				if (key < (dimensionInfo.length - excludedDim)) {
					selectable = 'selectable';
					sheetNavigation = cell.qAttrExps.qValues["5"].qText;
					urlNavigation = cell.qAttrExps.qValues["6"].qText;
					navType = dimensionInfo["0"].NavigationType;
					if (sheetNavigation == 0 || sheetNavigation == '0') {
						sheetNavigation = 'nosel';
					} else {
						sheetNavigation = cell.qAttrExps.qValues["5"].qText;
					}
				} else {
						if(measureInfo[key - dimensionInfo.length]!=undefined){
							//console.log(key,measureInfo[key - dimensionInfo.length]);
							selectable = (measureInfo[key - dimensionInfo.length].mesSelEnable ? 'messel' : 'selectableMes');
							mesSel = (measureInfo[key - dimensionInfo.length].mesSelEnable ? cell.qAttrExps.qValues["5"].qText : 'nosel');
							measure = measure + 1;
							SubTotal = ' sum';
							sheetNavigation = (measureInfo[key - dimensionInfo.length].mesCellNavEnable?measureInfo[key - dimensionInfo.length].MesSheetNavigation:'nosel');
						}
				}
				if (cell.qIsOtherCell) {
					cell.qText = dimensionInfo[key].othersLabel;
				}
				html += "<td mesSel='"+mesSel+"' val='" + (cell.qNum == undefined ? 0 : cell.qNum) + "' class='" + selectable + SubTotal + "' dim-col='" + key + "' dim-index='" + cell.qElemNumber + "' style='"+Rowcss+" padding: " + CellPadding + "; border: 1px solid " + BorderColor + "; color:" + txtcolor + "; background:" + bgcolor + "; text-align:" + align + "; font-size:" + size + "px; " + addcss + " '";
				if (!isNaN(cell.qNum)) {
					html += "class='numeric'";
				}
				if (navType == 2) {
					html += '><a href="' + urlNavigation + '" target="_blank">' + (cell.qText == undefined ? '' : cell.qText) + '</a></td>';
				} else if (navType == 3) {
				//text-decoration:underline;
					html += '><span style="" sheetnav="' + sheetNavigation + '">' + (cell.qText == undefined ? '' : cell.qText) + '</span></td>';
				} else {
					html += '><div sheetnav="' + sheetNavigation + '">' + (cell.qText == undefined ? '' : cell.qText) + '</div></td>';
				}
			});
			measure = 0;
			html += '</tr>';
		});
		return html;
	}

	function createHeader(Info, layout, ColType) {
		var html = '',Headercss = layout.Headercss,
			headerFontSize = (layout.headerFontSize == undefined ? '14' : layout.headerFontSize),
			wraptext = (layout.wraptext ? 'white-space:pre-wrap !important;' : ''),
			BorderColor = layout.BorderColor,
			CellPadding = layout.HeaderCellPadding,
			dimcnt = layout.qHyperCube.qDimensionInfo.length,
			enableFilter =(ColType == 'dim'?(layout.enableFilter?'<span style="display:none;margin-left:4px;" class="lui-icon lui-icon--search"></span>':''):'');
		Info.forEach(function(cell, key) {
			var verify = (ColType == 'dim' ? (cell.qFallbackTitle != undefined) : (cell.qFallbackTitle != undefined));
			if (verify) {
				ColGrp += '<col style=" width:' + cell.ColWidth + 'px;"></col>';
				var txtcolorHeader = (layout.DefaultHeaderStyle ? layout.HeaderColor : cell.txtcolorHeader),
					backgroundcolorHeader = (layout.DefaultHeaderStyle ? layout.HeaderBgColor : cell.backgroundcolorHeader),
					HeaderAlignation = cell.HeaderAlignation,
					colSpanHeader = (cell.colSpanHeader == undefined ? 1 : cell.colSpanHeader),
					ColWidth = (cell.ColWidth == undefined ? '' : 'width:' + cell.ColWidth + 'px;'),
					hide = (cell.hide == true ? 'display:none;' : ''),
					sortInd = '',
					mesNavEnable=cell.mesNavEnable,
					MesSheetNavigation=cell.MesSheetNavigation,
					SheetID=(layout.enableNavigation && mesNavEnable?MesSheetNavigation:'nosel');;
				/*
				if (cell.qSortIndicator === 'A' || cell.qSortIndicator === "A") {
					sortInd = "<i style='z-index: 2;' class='icon-triangle-top'><i>";
				} else {
					sortInd = "<i style='z-index: 2;' class='icon-triangle-bottom'><i>";
				}*/
				//
				html += '<td style="  font-weight:600; border: 1px solid ' + BorderColor + '; color:' + txtcolorHeader + '; background:' + backgroundcolorHeader + ';" class="sortHeader" ' + ColType + '-col="' + (ColType == 'mes' ? (dimcnt + key) : key) + '" colspan="' + colSpanHeader + '"><div sheetnav="'+SheetID+'" style="'+Headercss+'padding:' + CellPadding + '; ' + hide + ' color:' + txtcolorHeader + '; background:' + backgroundcolorHeader + '; text-align:' + HeaderAlignation + '; font-size:' + headerFontSize + 'px; ' + wraptext + '">' + sortInd + cell.qFallbackTitle + enableFilter + '</div></td>';
			} else {
				if (ColType == 'dim') {
					excludedDim = excludedDim + 1;
				} else {
					excludedMes = excludedMes + 1;
				}
			}
		});
		return html;
	}
	return {
		initialProperties: {
			customRow: [],
			customRow2: [],
			customHeader: [],
			customHeader2: [],
			SubTotal: [],
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 50,
					qHeight: 50
				}]
			}
		},
		definition: prop,
		support: {
			snapshot: false,
			export: true,
			exportData: true,
			//copyValue:true
		},
		paint: function($element, layout) {
			console.log(layout);
			var objid = layout.qInfo.qId;
			$element.attr("id", "table_container_" + objid);
			$element.css("overflow", "scroll");
			var app= qlik.currApp(),
				customWidth = layout.customWidth,
				html = "<table id='table_" + objid + "'" + "style='border: 0px solid #ddd; table-layout: " + (customWidth ? 'auto' : 'fixed') + "; width:" + (customWidth ? layout.tableWidth : '100%') + "; '" + "><thead>",
				self = this,
				morebutton = false,
				hypercube = layout.qHyperCube,
				rowcount = hypercube.qDataPages[0].qMatrix.length,
				dimCount = hypercube.qDimensionInfo.length,
				mesCount = hypercube.qMeasureInfo.length,
				colcount = dimCount + mesCount,
				column = hypercube.qSize.qcx,
				totalrows = hypercube.qSize.qcy,
				pageheight = Math.floor(10000 / column),
				numberOfPages = Math.ceil(totalrows / pageheight),
				index,
				colspan,
				label,
				tabletd = '',
				tableth = '',
				enableTotal = layout.enableTotal,
				totalAlign = layout.totalAlign,
				header = '',
				//headerFontSize = (layout.headerFontSize == undefined ? '14px' : layout.headerFontSize),
				CustomHeader = '',
				CustomHeaderPos = 1,
				totalHtml = '',
				wraptext = (layout.wraptext ? 'pre-wrap !important' : ''),
				BorderColor = layout.BorderColor,
				CellPadding = layout.DataCellPadding,
				txtcolor = (layout.DefaultHeaderStyle ? layout.DataColor : '#000'),
				bgcolor = (layout.DefaultHeaderStyle ? layout.DataBgColor : '#ffffff'),
				tdfontsize = (layout.tdFontsizeshow ? layout.tdFontsize : '15');
			//render header titles
			header += "<tr id='thead_" + objid + "'>";
			//Dimension Header Info
			header += createHeader(hypercube.qDimensionInfo, layout, 'dim');
			//Measure Header Info
			header += createHeader(hypercube.qMeasureInfo, layout, 'mes');
			header += "</tr>";
			// customHeader
			$.each(layout.customHeader, function(key, val) {
				$.each(val.customHeader2, function(k1, td) {
					var thcolspan = val.colspan,
						colspan = td.colspan,
						label = td.label;
					var addcss = td.addcss;
					tableth += '<th colspan="' + colspan + '" style="' + addcss + ' background:' + td.bgcolor + '; color:' + td.color + ';"><div>' + label + '</div></th>';
				});
				CustomHeader += '<tr id="' + val.cId + '" style="background:' + val.bgcolor + ';">' + tableth + '</tr>';
				if (val.after_before == 1) {
					CustomHeaderPos = 1;
				} else if (val.after_before == 2) {
					CustomHeaderPos = 2;
				}
				tableth = '';
			});
			if (CustomHeaderPos == 1) {
				html += CustomHeader;
				html += header;
			} else {
				html += header;
				html += CustomHeader;
			}
			html += "</thead><tbody id='data_" + objid + "'>"
			// Total
			if (enableTotal) {
				var txtcolor = "color:" + (layout.DefaultTotalStyle ? layout.TotalColor : '#ffffff') + ";",
					backgroundcolor = "background:" + (layout.DefaultTotalStyle ? layout.TotalBgColor : '#ccc') + ";",
					TBorderColor = "border:1px solid " + layout.BorderColor + ";",
					TCellPadding = "padding:" + layout.TotalCellPadding + ";",
					FontSize = "font-size:" + layout.TotalFontSize + ";",
					FStyle = txtcolor + backgroundcolor + TCellPadding + FontSize;
				totalHtml += (totalAlign == "2" ? "<tfoot>" : "<thead>");
				totalHtml += "<tr id='total_top_" + objid + "'><td style='" + txtcolor + backgroundcolor + TBorderColor + "'><div style='" + FStyle + "'>Total</div></td>";
				//colspan='"+(dimCount)+"'
				for (var i = 0; i < (dimCount - 1); i++) {
					totalHtml += "<td style='font-weight:600; text-align:"+layout.TotalTextAlign+"; " + txtcolor + backgroundcolor + TBorderColor + "' class='dummy'><div style='" + FStyle + "'>&nbsp;</div></td>";
				}
				hypercube.qGrandTotalRow.forEach(function(cell) {
					totalHtml += '<td style="font-weight:600; text-align:'+layout.TotalTextAlign+'; ' + txtcolor + backgroundcolor + TBorderColor + '"><div style="' + FStyle + '">' + cell.qText + '</div></td>';
				});
				totalHtml += "</tr>";
				totalHtml += (totalAlign == "2" ? "</tfoot>" : "</thead>");
				html += totalHtml;
			}
			//render data
			html += createRows(hypercube.qDataPages[0].qMatrix, hypercube.qDimensionInfo, hypercube.qMeasureInfo, layout);
			if($('#colgroup_'+objid).length==0){
				html += (customWidth ? "<colgroup id='colgroup_" + objid + "'>" + ColGrp + "</colgroup>" : '');
			}
			html += "</tbody></table>";
			$element.html("<button class='lui-button' id='export_" + objid + "' style='float: right;margin-bottom: 2px;'><span class='lui-icon lui-icon--export'></span></button>" + html);
			if (layout.enableExport) {
				$("#export_" + objid).show().click(function() {
					tableToExcel('table_' + objid, 'W3C Example Table');
				});
			} else {
				$("#export_" + objid).hide();
			}
			// Custom Row
			$.each(layout.customRow, function(k, v) {
				index = v.index - 1;
				$.each(v.customRow2, function(k1, td) {
					colspan = td.colspan;
					label = td.label;
					var addcss = td.addcss;
					tabletd += '<td colspan="' + colspan + '" style="' + addcss + ' background:' + td.bgcolor + '; color:' + td.color + ';">' + label + '</td>';
				});
				if (v.after_before == 1) {
					$('#table_' + objid + ' > tbody tr:eq(' + index + ')').after('<tr id="' + v.cId + '" style="background:' + v.bgcolor + ';">' + tabletd + '</tr>');
				} else {
					$('#table_' + objid + ' > tbody tr:eq(' + index + ')').before('<tr id="' + v.cId + '" style="background:' + v.bgcolor + ';">' + tabletd + '</tr>');
				}
				tabletd = '';
			});
			// Sub-Total
			$.each(layout.SubTotal, function(k, td) {
				var style = "white-space: " + wraptext + ";" + "border:1px solid " + BorderColor + ";" + "padding:" + CellPadding + ";" + "font-size:" + tdfontsize + "px;",
					index = td.index - 1,
					format = td.format,
					xtraCalc = td.xtraCalc,
					xtraCalcStr = td.xtraCalcStr,
					totalAlign = td.totalAlign;
				label = td.label;
				var addcss = td.addcss;
				tabletd += '<td style="' + style + addcss + ' background:' + td.bgcolor + '; color:' + td.color + '; text-align:' + totalAlign + ';">' + label + '</td>';
				for (var i = 0; i < (dimCount - 1); i++) {
					tabletd += '<td style="' + style + addcss + ' background:' + td.bgcolor + '; color:' + td.color + '; text-align:' + totalAlign + ';">&nbsp;</td>';
				}
				for (var i = 0; i < (mesCount); i++) {
					tabletd += '<td style="' + style + addcss + ' background:' + td.bgcolor + '; color:' + td.color + '; text-align:' + totalAlign + ';" class="subtotal"></td>';
				}
				if (td.after_before == 1) {
					$('#table_' + objid + ' > tbody tr:eq(' + index + ')').after('<tr id="' + td.cId + '" style="background:' + td.bgcolor + ';">' + tabletd + '</tr>');
					gen_sums('table_' + objid, format, xtraCalc, xtraCalcStr);
				} else {
					$('#table_' + objid + ' > tbody tr:eq(' + index + ')').before('<tr id="' + td.cId + '" style="background:' + td.bgcolor + ';">' + tabletd + '</tr>');
					gen_sums('table_' + objid, format, xtraCalc, xtraCalcStr);
				}
				tabletd = '';
				/*
				<tr class="totals">
					<th colspan="" >Total</th><td class="total"></td><td class="total"></td><td class="total"></td>
				</tr>
				*/
			});
			//Fixed Right or Left or header or footer
			if (layout.fixHeader || layout.fixFooter) {
				var fixRightCol = 0,
					fixLeftCol = 0;
				//if(layout.fixRight){
				//	fixRightCol=layout.fixRightCol;
				//}
				if (layout.fixLeft) {
					fixLeftCol = layout.fixLeftCol;
				}
				$('#table_' + objid).tableHeadFixer({
					//'right' : fixRightCol,
					'head': layout.fixHeader,
					'left': fixLeftCol,
					'foot': layout.fixFooter
				});
			}
			// Fixed header end
			// Add click functions to ".selectable" items
			if (layout.enableSelections) {
				$element.find(".selectable").on("click", function() {
					// Get the dimension column number
					var dimCol = parseInt(this.getAttribute("dim-col"));
					// Get the dimension value index
					var dimInd = parseInt(this.getAttribute("dim-index"));
					if (layout.selectionMode === "CONFIRM") {
						self.selectValues(dimCol, [dimInd], true);
						$element.find("[dim-col='" + dimCol + "'][dim-index='" + dimInd + "']").toggleClass("selected");
					} else {
						self.backendApi.selectValues(dimCol, [dimInd], true);
					}
					// lock Measure
					$("#table_" + objid + " td.selectableMes").each(function(k, v) {
						$(v).addClass("cell-locked");
					});
				});
			}
			$element.find('.sortHeader').on('click', function() {
				var parent = this.parentNode;
				if (this.hasAttribute("dim-col")) {
					var col = parseInt(this.getAttribute("dim-col"), 10);
					//setSortOrder(self, col);
					//reverseOrder(self, col, 'dim');
				}
				if (this.hasAttribute("mes-col")) {
					var col = parseInt(this.getAttribute("mes-col"), 10);
					//reverseOrder(self, col, 'mes');
					//setSortOrder(self, col);
				}
			});
			if (layout.enableNavigation) {
				$('td span').click(function() {
					var val = $(this).attr('sheetnav');
					if (val == 'nosel') {
					} else {
						qlik.navigation.gotoSheet(val);
					}
				});
				$('td div').click(function() {
					var val = $(this).attr('sheetnav');
					if (val == 'nosel') {
					} else {
						qlik.navigation.gotoSheet(val);
					}
				});
			}
			// mes selection
				$(".messel").click(function() {
					// Get the dimension column number
					var sel =$(this).attr("messel");
					var a=sel.split('|');
					$.each(a,function(k,v){
						var b = v.split(';'),
							field=b[0],
							value=b[1].split(':');
						app.field(field).selectValues(value, true, true);
						console.log(field,value);
					});
					
				});
			// Function for creating a page fetcher function based on page number
			function fetchPage(numberOfPages, row) {
				var requestPage = [{
					qTop: row,
					qLeft: 0,
					qWidth: colcount,
					qHeight: Math.min(50, totalrows - rowcount)
				}];
				self.backendApi.getData(requestPage).then(function(dataPages) {
					rowcount += dataPages[0].qMatrix.length;
					var html = createRows(dataPages[0].qMatrix, hypercube.qDimensionInfo, hypercube.qMeasureInfo, layout);
					$element.find("#data_" + objid).append(html);
				});
			}
			// data fetch on Scroll		
			var Container = document.getElementById("table_container_" + objid);
			Container.addEventListener('scroll', function() {
				if (Container.scrollTop + Container.clientHeight >= Container.scrollHeight) {
					if (totalrows > rowcount) {
						fetchPage(numberOfPages, rowcount);
					}
				}
			});
			
			
			
			// added
			
			
			/*
			let promises = Array.apply(null, Array(numberOfPages)).map(function (data, index) {
				let page = {
					qTop: (pageheight * index) + index,
					qLeft: 0,
					qWidth: column,
					qHeight: pageheight
				};
				
				console.log("Details",pageheight,column,numberOfPages,index,data);
				return self.getHyperCubeData('/qHyperCubeDef', [page]);
			}, this)
			
			Promise.all(promises).then(function(data) {
				console.log("PromiceGetDataNew",data);
			});
			*/
			
			ColGrp = '';

			
			
			return qlik.Promise.resolve();
		}
	};
});
