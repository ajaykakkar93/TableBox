define(["qlik", "jquery"], function(qlik, $) {
	var colorInfo = {
			label: "Add all the below as string(='color | bdcolor | textalign | header bgcolor | header color')",
			component: "text"
		},
		ColWidth = {
			type: "integer",
			ref: "qDef.ColWidth",
			label: "Column Width",
			defaultValue: 100
		},
		textcolor = {
			type: "string",
			ref: "qAttributeExpressions.0.qExpression",
			label: "Text Color",
			//expression: "always",
			component: "expression",
			defaultValue: "='#000'"
		},
		backgroundcolor = {
			type: "string",
			ref: "qAttributeExpressions.1.qExpression",
			label: "Background Color",
			//expression: "always",
			component: "expression",
			defaultValue: "='white'"
		},
		/*textaligntext = {
			type: "string",
			ref: "qAttributeExpressions.2.qExpression",
			label: "Text align(left,right,center)",
			//expression: "always",
			component: "expression",
			defaultValue: "='center'"
		},*/
		textalign = {
			type: "string",
			component: "dropdown",
			label: "Text Align",
			ref: "qAttributeExpressions.2.qExpression",
			options: [{
				value: "1",
				label: "Left"
			}, {
				value: "2",
				label: "Right"
			}, {
				value: "3",
				label: "Center"
			}]
		},
		textsize = {
			type: "string",
			ref: "qAttributeExpressions.3.qExpression",
			label: "Text size(in px)",
			//expression: "always",
			component: "expression",
			defaultValue: "='12'"
		},
		Addcss = {
			type: "string",
			ref: "qAttributeExpressions.4.qExpression",
			label: "Additional Style(Use standard CSS)",
			//expression: "always",
			component: "expression"
			//defaultValue: "=''"
		},
		HeaderAlign = {
			type: "string",
			component: "dropdown",
			label: "Header Align",
			ref: "qDef.HeaderAlignation",
			options: [{
				value: "left",
				label: "Left"
			}, {
				value: "right",
				label: "Right"
			}, {
				value: "center",
				label: "Center"
			}],
			defaultValue: "center"
		},
		backgroundcolorHeader = {
			type: "string",
			ref: "qDef.backgroundcolorHeader",
			label: "Header Background Color",
			expression: "always",
			//component: "expression",
			defaultValue: "='white'"
		},
		txtcolorHeader = {
			type: "string",
			ref: "qDef.txtcolorHeader",
			label: "Header Text Color",
			expression: "always",
			//component: "expression",
			defaultValue: "='#000'"
		},
		colSpanHeader = {
			type: "integer",
			ref: "qDef.colSpanHeader",
			label: "Header Column Span"
		},
		hide = {
			type: "boolean",
			component: "switch",
			label: "Hide Header",
			ref: "qDef.hide",
			options: [{
				value: true,
				label: "On"
			}, {
				value: false,
				label: "Not On"
			}],
			defaultValue: false
		},
		Clabel = {
			type: "string",
			ref: "label",
			label: "Label",
			expression: "optional"
		},
		custom_row_header_color = {
			label: "Text Color",
			type: "string",
			ref: "color",
			expression: "optional"
		},
		custom_row_header_bgcolor = {
			label: "Text Background Color",
			type: "string",
			ref: "bgcolor",
			expression: "optional"
		},
		colspan = {
			label: "Colspan",
			component: "string",
			ref: "colspan"
		},
		custom_row_header_addcss = {
			label: "Custom CSS",
			type: "string",
			ref: "addcss",
			expression: "optional"
		},
		fixHeader = {
			type: "boolean",
			component: "switch",
			label: "Fixed Header",
			ref: "fixHeader",
			options: [{
				value: true,
				label: "On"
			}, {
				value: false,
				label: "Not On"
			}],
			defaultValue: true
		},
		fixFooter = {
			type: "boolean",
			component: "switch",
			label: "Fixed Footer",
			ref: "fixFooter",
			options: [{
				value: true,
				label: "On"
			}, {
				value: false,
				label: "Not On"
			}],
			defaultValue: true
		},
		fixRight = {
			type: "boolean",
			component: "switch",
			label: "Fixed Right",
			ref: "fixRight",
			options: [{
				value: true,
				label: "On"
			}, {
				value: false,
				label: "Not On"
			}],
			defaultValue: false,
			show: function(d) {
				return d.fixHeader || d.fixFooter;
			}
		},
		fixRightCol = {
			type: "integer",
			ref: "fixRightCol",
			label: "Fixed Right Column",
			expression: "optional",
			defaultValue: "1",
			show: function(d) {
				return d.fixRight;
			}
		},
		fixLeft = {
			type: "boolean",
			component: "switch",
			label: "Fixed Left",
			ref: "fixLeft",
			options: [{
				value: true,
				label: "On"
			}, {
				value: false,
				label: "Not On"
			}],
			defaultValue: false,
			show: function(d) {
				return d.fixHeader || d.fixFooter;
			}
		},
		fixLeftCol = {
			type: "integer",
			ref: "fixLeftCol",
			label: "Fixed Left Column",
			expression: "optional",
			defaultValue: "1",
			show: function(d) {
				return d.fixLeft;
			}
		},
		showIF = {
			type: "string",
			label: "Show Column IF",
			ref: "qCalcCondition.qCond.qv", 
			component: "expression"
		};
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions: {
				uses: "dimensions",
				min: 0,
				max: 13,
				items: {
					showIF: showIF,
					info: colorInfo,
					ColWidth: ColWidth,
					textcolor: textcolor,
					backgroundcolor: backgroundcolor,
					textalign: textalign,
					textsize: textsize,
					Addcss: Addcss,
					HeaderAlign: HeaderAlign,
					backgroundcolorHeader: backgroundcolorHeader,
					txtcolorHeader: txtcolorHeader,
					colSpanHeader: colSpanHeader,
					NavigationType: {
						type: "string",
						component: "dropdown",
						label: "Navigation Type",
						ref: "qDef.NavigationType",
						options: [{
							value: "1",
							label: "None"
						}, {
							value: "2",
							label: "URL"
						}, {
							value: "3",
							label: "Sheet Nav"
						}]
					},
					sheetNavigation: {
						type: "string",
						ref: "qAttributeExpressions.5.qExpression",
						label: "Sheet Navigation",
						//expression: "always",
						component: "expression",
						show: function(d) {
							return d.qDef.NavigationType == 3;
						}
					},
					urlNavigation: {
						type: "string",
						ref: "qAttributeExpressions.6.qExpression",
						label: "URL Navigation",
						//expression: "always",
						component: "expression",
						show: function(d) {
							return d.qDef.NavigationType == 2;
						}
					},
					hide: hide
				}
			},
			// end dimension arr
			measures: {
				uses: "measures",
				min: 0,
				max: 13,
				items: {
					showIF: showIF,
					TotalAggr: {
						type: "string",
						label: "Total Function",
						ref: "qDef.qAggrFunc",
						component: "dropdown",
						options: [{
							value: "Expr",
							label: "Auto"
						},{
							value: "Avg",
							label: "Avg"
						}, {
							value: "Count",
							label: "Count"
						}, {
							value: "Min",
							label: "Min"
						}, {
							value: "Max",
							label: "Max"
						}, {
							value: "Sum",
							label: "Sum"
						},{
							value: "None",
							label: "None"
						}]
					},
					info: colorInfo,
					ColWidth: ColWidth,
					textcolor: textcolor,
					backgroundcolor: backgroundcolor,
					textalign: textalign,
					textsize: textsize,
					Addcss: Addcss,
					HeaderAlign: HeaderAlign,
					backgroundcolorHeader: backgroundcolorHeader,
					txtcolorHeader: txtcolorHeader,
					colSpanHeader: colSpanHeader,
					hide: hide,
					mesNavEnable:{
						type: "boolean",
						component: "switch",
						label: "Sheet Navigation(By Column)",
						ref: "qDef.mesNavEnable",
						options: [{
							value: true,
							label: "Navigation On"
						}, {
							value: false,
							label: "No Navigation"
						}],
						defaultValue: false
					},
					MesSheetNavigation: {
						type: "string",
						ref: "qDef.MesSheetNavigation",
						label: "Sheet Navigation(By Column)",
						expression: "optional",
						show:function(d){
							return d.qDef.mesNavEnable;
						}
					},
					//end
					MesSheetNavigation: {
						type: "string",
						ref: "qDef.MesSheetNavigation",
						label: "Sheet Navigation(By Column)",
						expression: "optional",
						show:function(d){
							return d.qDef.mesNavEnable;
						}
					},
					mesCellNavEnable:{
						type: "boolean",
						component: "switch",
						label: "Sheet Navigation(By Cell)",
						ref: "qDef.mesCellNavEnable",
						options: [{
							value: true,
							label: "Navigation On"
						}, {
							value: false,
							label: "No Navigation"
						}],
						defaultValue: false,
						show:function(d){
							return d.qDef.mesNavEnable;
						}
					},
					//start
					mesSelEnable:{
						type: "boolean",
						component: "switch",
						label: "Select Value(By Cell)",
						ref: "qDef.mesSelEnable",
						options: [{
							value: true,
							label: "Navigation On"
						}, {
							value: false,
							label: "No Navigation"
						}],
						defaultValue: false
					},
					mesCellSelection: {
						type: "string",
						ref: "qAttributeExpressions.5.qExpression",
						label: "Value to select(Field;value|Field;value:value:..)",
						//expression: "always",
						component: "expression",
						show:function(d){
							return d.qDef.mesSelEnable;
						}
					},
					//end
				}
			},
			//Custom Head & Row
			DefaultStyle: {
				type: "items",
				label: "Table Settings",
				component: "expandable-items",
				items: {
					//start
					dataStyle: {
						type: "items",
						label: "Header/Data Settings",
						items: {
							customWidth: {
								type: "boolean",
								component: "switch",
								label: "Custom Width",
								ref: "customWidth",
								options: [{
									value: true,
									label: "Fixed"
								}, {
									value: false,
									label: "Auto"
								}],
								defaultValue: false
							},
							tableWidth: {
								label: "Table Width",
								type: "string",
								ref: "tableWidth",
								defaultValue: "100%",
								show: function(d) {
									return d.customWidth;
								}
							},
							wraptext: {
								type: "boolean",
								component: "switch",
								label: "Wrap Text",
								ref: "wraptext",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: true
							},
							BorderColor: {
								label: "Border Color",
								type: "string",
								ref: "BorderColor",
								defaultValue: "#ffffff"
							},
							headerFontSizeshow: {
								type: "boolean",
								component: "switch",
								label: "Table Header Font size",
								ref: "headerFontSizeshow",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: true
							},
							headerFontSize: {
								label: "Header Font Size",
								type: "integer",
								ref: "headerFontSize",
								defaultValue: 16,
								show: function(d) {
									return d.headerFontSizeshow;
								}
							},
							DefaultHeaderStyle: {
								type: "boolean",
								component: "switch",
								label: "Default Header Style",
								ref: "DefaultHeaderStyle",
								options: [{
									value: true,
									label: "Default"
								}, {
									value: false,
									label: "Custom"
								}],
								defaultValue: true
							},
							Headercss: {
								label: "Header CSS",
								type: "string",
								ref: "Headercss",
								show: function(d) {
									return d.DefaultHeaderStyle;
								}
							},
							HeaderColor: {
								label: "Header Color",
								type: "string",
								ref: "HeaderColor",
								defaultValue: "#fff",
								show: function(d) {
									return d.DefaultHeaderStyle;
								}
							},
							HeaderBgColor: {
								label: "Header Background Color",
								type: "string",
								ref: "HeaderBgColor",
								defaultValue: "#1d96b2",
								show: function(d) {
									return d.DefaultHeaderStyle;
								}
							},
							HeaderCellPadding: {
								label: "Header Cell Padding",
								type: "string",
								ref: "HeaderCellPadding",
								defaultValue: "2px 5px",
								show: function(d) {
									return d.DefaultDataStyle;
								}
							},
							DefaultTotalStyle: {
								type: "boolean",
								component: "switch",
								label: "Default Total Style",
								ref: "DefaultTotalStyle",
								options: [{
									value: true,
									label: "Default"
								}, {
									value: false,
									label: "Custom"
								}],
								defaultValue: true
							},
							TotalColor: {
								label: "Total Color",
								type: "string",
								ref: "TotalColor",
								defaultValue: "#fff",
								show: function(d) {
									return d.DefaultTotalStyle;
								}
							},
							TotalBgColor: {
								label: "Total Background Color",
								type: "string",
								ref: "TotalBgColor",
								defaultValue: "#1d96b2",
								show: function(d) {
									return d.DefaultTotalStyle;
								}
							},
							TotalCellPadding: {
								label: "Total Cell Padding",
								type: "string",
								ref: "TotalCellPadding",
								defaultValue: "2px 5px",
								show: function(d) {
									return d.DefaultTotalStyle;
								}
							},
							TotalFontSize: {
								label: "Total Font Size",
								type: "string",
								ref: "TotalFontSize",
								defaultValue: "15px",
								show: function(d) {
									return d.DefaultTotalStyle;
								}
							},
							tdFontsizeshow: {
								type: "boolean",
								component: "switch",
								label: "Table Data Font size",
								ref: "tdFontsizeshow",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: true
							},
							tdFontsize: {
								label: "Data Font Size",
								type: "integer",
								ref: "tdFontsize",
								defaultValue: 16,
								show: function(d) {
									return d.tdFontsizeshow;
								}
							},
							DefaultDataStyle: {
								type: "boolean",
								component: "switch",
								label: "Default Data Style",
								ref: "DefaultDataStyle",
								options: [{
									value: true,
									label: "Default"
								}, {
									value: false,
									label: "Custom"
								}],
								defaultValue: false
							},
							Rowcss: {
								label: "Row CSS",
								type: "string",
								ref: "Rowcss",
								show: function(d) {
									return d.DefaultDataStyle;
								}
							},
							DataColor: {
								label: "Data Color",
								type: "string",
								ref: "DataColor",
								defaultValue: "#000",
								show: function(d) {
									return d.DefaultDataStyle;
								}
							},
							DataBgColor: {
								label: "Data Background Color",
								type: "string",
								ref: "DataBgColor",
								defaultValue: "#fff",
								show: function(d) {
									return d.DefaultDataStyle;
								}
							},
							DataCellPadding: {
								label: "Data Cell Padding",
								type: "string",
								ref: "DataCellPadding",
								defaultValue: "2px 5px",
								show: function(d) {
									return d.DefaultDataStyle;
								}
							}
							//end
						}
					},
					tableSettings: {
						type: "items",
						label: "More Settings",
						items: {
							enableFilter: {
								type: "boolean",
								component: "switch",
								label: "Enable Filter",
								ref: "enableFilter",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: false
							},
							enableExport: {
								type: "boolean",
								component: "switch",
								label: "Enable Custom Report Export",
								ref: "enableExport",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: false
							},
							enableSelections: {
								type: "boolean",
								component: "switch",
								label: "Enable Selections",
								ref: "enableSelections",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: false
							},
							singleSelection: {
								type: "boolean",
								label: "Single Selection",
								ref: "singleSelection",
								defaultValue: false,
								show: function(d) {
									return !d.enableSelections;
								}
							},
							selectionMode: {
								type: "string",
								component: "radiobuttons",
								label: "Selection Mode",
								ref: "selectionMode",
								options: [{
									value: "CONFIRM",
									label: "Confirm"
								}, {
									value: "NOCONFIRM",
									label: "Dont Confirm"
								}],
								defaultValue: "CONFIRM"
							},
							enableNavigation: {
								type: "boolean",
								component: "switch",
								label: "Enable Navigation",
								ref: "enableNavigation",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: false
							},
							fixHeader: fixHeader,
							fixFooter: fixFooter,
							//fixRight: fixRight,
							//fixRightCol: fixRightCol
							fixLeft: fixLeft,
							fixLeftCol: fixLeftCol,
							//end
							enableTotal: {
								type: "boolean",
								component: "switch",
								label: "Enable Total",
								ref: "enableTotal",
								options: [{
									value: true,
									label: "On"
								}, {
									value: false,
									label: "Not On"
								}],
								defaultValue: false
							},
							totalAlign: {
								type: "string",
								component: "dropdown",
								label: "Total Align",
								ref: "totalAlign",
								options: [{
									value: "1",
									label: "Top"
								}, {
									value: "2",
									label: "Bottom"
								}],
								defaultValue: "1",
								show: function(d) {
									return d.enableTotal;
								}
							}
							// end total
						}
					}
					//end
				}
			},
			CustomHeadRow: {
				type: "items",
				label: "Custom Header & Row",
				items: {
					//Header Start
					addCustomHeader: {
						type: "items",
						label: "Add Custom Header",
						component: "expandable-items",
						items: {
							customHeader: {
								type: "array",
								ref: "customHeader",
								label: "Header Row",
								itemTitleRef: "label",
								allowAdd: true,
								allowRemove: true,
								addTranslation: "Add Custom Header",
								items: {
									label: Clabel,
									after_before: {
										type: "string",
										component: "dropdown",
										label: "Align After/Before",
										ref: "after_before",
										options: [{
											value: 1,
											label: "After"
										}, {
											value: 2,
											label: "Before"
										}],
										defaultValue: 1
									},
									customHeader2: {
										type: "array",
										ref: "customHeader2",
										label: "Header Items",
										itemTitleRef: "label",
										allowAdd: true,
										allowRemove: true,
										addTranslation: "Add Cell",
										items: {
											label: Clabel,
											colspan: colspan,
											color: custom_row_header_color,
											bgcolor: custom_row_header_bgcolor,
											addcss: custom_row_header_addcss
											//end
										}
									}
								}
							}
						}
					},
					// Header End
					// Row Start
					addCustomRow: {
						type: "items",
						label: "Add Custom Row",
						component: "expandable-items",
						items: {
							customRow: {
								type: "array",
								ref: "customRow",
								label: "Custom Row",
								itemTitleRef: "index",
								allowAdd: true,
								allowRemove: true,
								addTranslation: "Add Custom Row",
								items: {
									after_before: {
										type: "string",
										component: "dropdown",
										label: "Align After/Before",
										ref: "after_before",
										options: [{
											value: 1,
											label: "After"
										}, {
											value: 2,
											label: "Before"
										}],
										defaultValue: 2
									},
									index: {
										label: "After which row to add",
										component: "number",
										ref: "index",
										defaultValue: 1
									},
									bgcolor: custom_row_header_bgcolor,
									customRow2: {
										type: "array",
										ref: "customRow2",
										label: "Table Data(td)",
										itemTitleRef: "label",
										allowAdd: true,
										allowRemove: true,
										addTranslation: "Add Cell",
										items: {
											label: Clabel,
											colspan: colspan,
											color: custom_row_header_color,
											bgcolor: custom_row_header_bgcolor,
											addcss: custom_row_header_addcss
										}
									}
								}
							}
						}
					},
					// sub total
					SubTotalArray: {
						type: "items",
						label: "Add Sub-Total Row",
						component: "expandable-items",
						items: {
							subTatalRow: {
								type: "array",
								ref: "SubTotal",
								label: "Sub-Total Row",
								itemTitleRef: "index",
								allowAdd: true,
								allowRemove: true,
								addTranslation: "Add Sub-Total Row",
								items: {
									label: Clabel,
									after_before: {
										type: "string",
										component: "dropdown",
										label: "Align After/Before",
										ref: "after_before",
										options: [{
											value: 1,
											label: "After"
										}, {
											value: 2,
											label: "Before"
										}],
										defaultValue: 2
									},
									index: {
										label: "After which row to add",
										component: "number",
										ref: "index",
										defaultValue: 1,
										expression: "optional"
									},
									FormatHelpLink: {
										label: "Format Help",
										component: "link",
										url: "http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e"
									},
									format: {
										type: "string",
										label: "Format Value (n|n|.1%)",
										ref: "format",
										defaultValue: "n|n|.1%",
										expression: "optional"
									},
									xtraCalc: {
										type: "string",
										label: "More Calc (*1|*1|*1)",
										ref: "xtraCalc",
										defaultValue: "*1|*1|*1",
										expression: "optional"
									},
									xtraCalcStr: {
										type: "string",
										label: "More Calc String",
										ref: "xtraCalcStr",
										defaultValue: "|%",
										expression: "optional"
									},
									bgcolor: custom_row_header_bgcolor,
									color: custom_row_header_color,
									totalAlign: {
										type: "string",
										component: "dropdown",
										label: "Total Align",
										ref: "totalAlign",
										options: [{
											value: "left",
											label: "Left"
										}, {
											value: "right",
											label: "Right"
										}, {
											value: "center",
											label: "Center"
										}],
										defaultValue: "left"
									},
									addcss: custom_row_header_addcss
								}
							}
						}
					}
					// row End
				}
			},
			// end measure arr
			sorting: {
				uses: "sorting"
			},
			addons: {
				uses: "addons",
				items: {
					dataHandling: {
						uses: "dataHandling"
					}
				}
			},
			// end sorting
			settings: {
				uses: "settings",
				items: {
					
					//end
				}
			}
			// end settings
		}
	};
});