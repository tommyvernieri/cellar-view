(function () {

  CellarView.Transform = (function() {

    var ellipsis,
      queryString,
      dataCleanupProcessor,
      dataPresentationProcessor,
      nonBreakingSpace,
      rowDataArray,
      rawDataURL,
      rawDataXML,
      rowDataset;
    
    ellipsis = String.fromCharCode(8230);
    nonBreakingSpace = String.fromCharCode(160);

    rowDataArray = [];

    function el(id) {
      return document.getElementById(id);
    }

    function getSingleElementByClassName(el, names) {
      var list;
      
      list = el.getElementsByClassName(names);
      if (list.length === 1) {
        return list[0];
      }
    }

    function setElementText(id, text) {      
      var element;

      element = el(id);
      
      while (element.firstChild !== null) {
        element.removeChild(element.firstChild);
      }
      element.appendChild(document.createTextNode(text));
    }
    
    function findClass(elementClass, className) {
      var currentClasses,
        existingClassIndex,
        i,
        length;

      currentClasses = elementClass.split(/\s+/);
      length = currentClasses.length;
      for (i = 0; i < length; i++) {
        if (currentClasses[i].toLowerCase() === className.toLowerCase()) {
          existingClassIndex = i;
          break;
        }
      }
      
      return {
        currentClasses: currentClasses,
        existingClassIndex: existingClassIndex
      };
    }
    
    function addClass(id, className) {
      var classFindResult,
        element;

      element = el(id);
      classFindResult = findClass(element.className, className);
      
      if (typeof classFindResult.existingClassIndex === 'undefined') {
        element.className += ' ' + className;
      }
    }
    
    function removeClass(id, className) {
      var classFindResult,
        element;

      element = el(id);
      classFindResult = findClass(element.className, className);
      
      if (typeof classFindResult.existingClassIndex !== 'undefined') {
        classFindResult.currentClasses.splice(classFindResult.existingClassIndex, 1);
        element.className = classFindResult.currentClasses.join(' ');
      }
    }
    
    function setProgressStatus(text) {
      setElementText('progress-status', text);
    }

    function setBlockElementVisible(id, visible) {
      var element;

      element = el(id);

      if (visible) {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
    }
    
    function setMainContentVisible(visible) {
      setBlockElementVisible('main', visible);
    }

    function setProgressVisible(visible) {
      setBlockElementVisible('progress', visible);
    }

    function setWineListVisible(visible) {
      setBlockElementVisible('wine-list-wrapper', visible);
    }

    function setSpinnerCompleted(completed) {
      var operation;
      
      if (completed) {
        operation = addClass;
      } else {
        operation = removeClass;
      }
      
      operation.call(this, 'spinner', 'completed');
    }

    function showMainContent() {
      setMainContentVisible(true);
      setProgressVisible(false);
      setWineListVisible(false);
    }
    
    function showProgress() {
      setSpinnerCompleted(false);
    
      setMainContentVisible(false);
      setProgressVisible(true);
      setWineListVisible(false);
    }

    function showWineList() {
      setMainContentVisible(false);
      setProgressVisible(false);
      setWineListVisible(true);
    }

    function getXMLAsyncXHR(url, callback) {
      var req;

      req = new XMLHttpRequest();

      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          if (!(req.status == 200 || req.status == 0)) {
            callback.call(this, null);
          } else {
            callback.call(this, req.responseXML);
          }
        }
      };

      req.onerror = function() {
        alert("An error occured while accessing CellarTracker.");
      };

      req.open('GET', url, true);
      req.send(null);
    }
    
    function getRawQueryString() {
      var result,
          queryString,
          re,
          m;

      result = {};
      queryString = location.search.substring(1);
      re = /([^&=]+)=([^&]*)/g;

      while (m = re.exec(queryString)) {
        result[decodeURIComponent(m[1]).toLowerCase()] = m[2];
      }

      return result;
    }

    function getIsTwoColumnLayoutFromQueryString() {
      return queryString["columns"] == 2;
    }

    function getHidePricesFromQueryString() {
      var hidePricesParam;
      
      hidePricesParam = queryString['hideprices'];
      
      if (typeof hidePricesParam !== "undefined") {
        if (hidePricesParam.toLowerCase() === 'true' || hidePricesParam === '1') {
          return true;
        }
      }
      
      return false;
    }

    function getCredentialsFromQueryString() {
      return {
        user: queryString["user"],
        password: queryString["password"]
      };
    }

    function getCredentialsFromForm() {
      return {
        user: el('user-input').value,
        password: el('password-input').value
      };
    }
    
    function computeNeededWineListWidth(parentEl, classNames, percent) {
      var el;
      
      el = getSingleElementByClassName(parentEl, classNames);
      
      if (el && el.scrollWidth > el.offsetWidth) {
        // 4px for table spacing
        return Math.ceil(el.scrollWidth / percent) + 4;
      } else {
        return 0;
      }
    }
        
    function updateLayout() {
      var columnCount,
        i,
        length,
        wineMaxWidth,
        wineListEl,
        wineListWrapperEl,
        wineListMinWidth,
        wineNodes;
        
      wineListWrapperEl = el('wine-list-wrapper');
      if (wineListWrapperEl) {
        wineListEl = getSingleElementByClassName(wineListWrapperEl, 'wine-list');
      }
      
      if (wineListEl) {
        wineNodes = wineListEl.getElementsByClassName('wine');
        length = wineNodes.length;
        wineMaxWidth = 0;
        
        for (i = 0; i < length; i++) {
          // 78% width from CSS
          wineMaxWidth = Math.max(wineMaxWidth, computeNeededWineListWidth(wineNodes[i], 'wine-name-and-locale', 0.78));

          // 20% width plus 2% padding from CSS
          wineMaxWidth = Math.max(wineMaxWidth, computeNeededWineListWidth(wineNodes[i], 'bin-and-price-list', 0.22));
          
          // If the chlid elements don't take up the full width, it doesn't matter.
          //// The child elements may not take up the full width due to CSS rounding
          //wineMaxWidth = Math.max(wineMaxWidth, wineNodes[i].offsetWidth + 4);
        }
        
        columnCount = (getIsTwoColumnLayoutFromQueryString() ? 2 : 3);

        //Set .wine-list min-width =
        //  (maximum width of .wine) * (column count of 3)
        //  + (column gap of 20) * ((column count of 3) - 1)
        wineListMinWidth = (wineMaxWidth * columnCount) + (20 * (columnCount - 1));        
        
        wineListMinWidth = Math.round(wineListMinWidth); //Make sure we didn't end up with a floating point number
        
        //HACK: I'm not sure why, but in Firefox the computed wineListMinWidth seems to always
        // be 3px bigger than the offsetWidth. This could be related to the 4px of table spacing.
        // Whithout this correction, resizing the page larger makes the minWidth grow.
        // In Chrome the wine locale is cut off by about one pixel, which may be related to this adjustment.
        wineListMinWidth -= 3;
        
        if (wineListEl.offsetWidth < wineListMinWidth) {
          //console.log('Updating wineListEl.style.minWidth. wineListEl.offsetWidth: ' + wineListEl.offsetWidth + ' wineListMinWidth: ' + wineListMinWidth);
          wineListEl.style.minWidth = wineListMinWidth + 'px';
        }
      }
      
    }

    function rowDataFromXML(row) {
      var childIndex,
        children,
        childNode,
        nodeText,
        rowData;

      rowData = {};
      children = row.childNodes;
      for (childIndex = 0; childIndex < children.length; childIndex++) {
          childNode = children[childIndex];
          if (childNode.nodeType === Node.ELEMENT_NODE) {
              nodeText = childNode.textContent;
              if (!!nodeText) {
                rowData[childNode.localName] = nodeText;
              }
          }
      }

      return rowData;
    }

    var varietalRules = [
      {t: 'Rosé', m: '*', vn: 'Rosé'},
      {t: 'White', m: 'White Rhone Blend', vn: 'White Blend'},
      {t: 'White', m: 'Pinot Gris-Pinot Blanc Blend', vn: 'White Blend'},
      {t: 'White', m: 'Sémillon-Sauvignon Blanc Blend', vn: 'White Blend'},
      {t: 'Red', m: 'Cabernet-Syrah Blend', vn: 'Red Blend'},
      {t: 'Red', m: 'Red Bordeaux Blend', vn: 'Red Blend - Bordeaux'},
      {t: 'Red', m: 'SuperTuscan Blend', vn: 'Red Blend - SuperTuscan'},
      {t: 'White - Sparkling', m: '*', vn: 'Sparkling'},
      {t: 'Rosé - Sparkling', m: '*', vn: 'Sparkling'},
      {t: 'Red - Sparkling', m: '*', vn: 'Sparkling'},
    ];

    var localeRules = [
      {c: 'USA', r: 'California', s: '*', a: '*', sn: '*', an: '*'},
      {c: 'USA', r: '*', s: '*', a: '*', rn: '*', sn: '*', an: '*'},
      {c: 'France', r: 'Languedoc Roussillon', s: 'Languedoc', a: '*', sn: '*', an: '*'},
      {c: 'France', r: 'Languedoc Roussillon', s: 'Roussillon', a: '*', sn: '*', an: '*'},
      {c: 'France', r: 'Champagne', s: '*', a: 'Champagne', rn: '*', sn: '*'},
      {c: 'France', r: 'France', s: '', a: '', cn: '*'},
      {c: 'France', r: '*', s: '*', a: '*', rn: '*', sn: '*', an: '*'},
      {c: 'Australia', r: 'South Australia', s: '*', a: '*', rn: '*', sn: '*', an: '*'}
    ];

    function prepareRow(rowData) {
      var typeGroupMap;

      //Map Type to TypeGroup
      typeGroupMap = {};
      typeGroupMap['White - Sparkling'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['Rosé - Sparkling'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['Red - Sparkling'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['Rosé'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['White'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['White - Off-dry'] = 'Sparkling, Rosé, and White Wines';
      typeGroupMap['Red'] = 'Red Wines';
      typeGroupMap['White - Sweet/Dessert'] = 'Dessert Wines';
      typeGroupMap['Rosé - Sweet/Dessert'] = 'Dessert Wines';
      typeGroupMap['Red - Sweet/Dessert'] = 'Dessert Wines';
      typeGroupMap['White - Fortified'] = 'Dessert Wines';
      typeGroupMap['Red - Fortified'] = 'Dessert Wines';
      typeGroupMap['Fruit/Vegetable Wine'] = 'Other';
      typeGroupMap['Sake'] = 'Other';
      typeGroupMap['Spirits'] = 'Other';
      typeGroupMap['Liqueur'] = 'Other';
      typeGroupMap['Non-alcoholic'] = 'Other';

      rowData['TypeGroup'] = typeGroupMap[rowData['Type']] || rowData['Type'];

      //Map Varietal to VarietalGroup
      var type,
        varietalGroup,
        varietalRule,
        varietalRuleIndex,
        masterVarietal;

      type = rowData['Type'];
      masterVarietal = rowData['MasterVarietal'];

      for (varietalRuleIndex = 0; varietalRuleIndex < varietalRules.length; varietalRuleIndex++) {
        varietalRule = varietalRules[varietalRuleIndex];
        if (varietalRule.t !== '*' && varietalRule.t !== type) {
          varietalRule = null;
          continue;
        }
        if (varietalRule.m !== '*' && varietalRule.m !== masterVarietal) {
          varietalRule = null;
          continue;
        }

        break;
      }

      if (varietalRule) {
        rowData['VarietalGroup'] = varietalRule.vn;

      } else {
        rowData['VarietalGroup'] = masterVarietal;
      }

      //Map Locale to LocaleAbbreviated
      var appellation,
        country,
        localeAbbreviated,
        localeRule,
        localeRuleIndex,
        region,
        subRegion;

      country = rowData['Country'];
      region = rowData['Region'];
      subRegion = rowData['SubRegion'];
      appellation = rowData['Appellation'];

      for (localeRuleIndex = 0; localeRuleIndex < localeRules.length; localeRuleIndex++) {
        localeRule = localeRules[localeRuleIndex];
        if (localeRule.c !== '*' && localeRule.c !== country) {
          localeRule = null;
          continue;
        }
        if (localeRule.r !== '*' && localeRule.r !== region) {
          localeRule = null;
          continue;
        }
        if (localeRule.s !== '*' && localeRule.s !== subRegion) {
          localeRule = null;
          continue;
        }
        if (localeRule.a !== '*' && localeRule.a !== appellation) {
          localeRule = null;
          continue;
        }

        break;
      }

      if (localeRule) {
        localeAbbreviated = '';

        if (localeRule.cn === '*') {
          if (country) {
            localeAbbreviated += country;
          }
        } else if (localeRule.cn) {
          localeAbbreviated += localeRule.cn;
        }

        if (localeRule.rn === '*') {
          if (region && region !== 'Unknown') {
            localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + region;
          }
        } else if (localeRule.rn) {
          localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + localeRule.rn;
        }

        if (localeRule.sn === '*') {
          if (subRegion && subRegion !== 'Unknown') {
            localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + subRegion;
          }
        } else if (localeRule.sn) {
          localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + localeRule.sn;
        }

        if (localeRule.an === '*') {
          if (appellation && appellation !== 'Unknown') {
            localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + appellation;
          }
        } else if (localeRule.an) {
          localeAbbreviated += (localeAbbreviated.length ? ', ' : '') + localeRule.an;
        }

        rowData['LocaleAbbreviated'] = localeAbbreviated;

      } else {
        rowData['LocaleAbbreviated'] = rowData['Locale'];
      }

      //Move the Bin to an array for normalization to handle wines in multiple bins
      if (!Array.isArray(rowData['BinList'])) {
        rowData['BinList'] = [];
        if (typeof rowData['Bin'] !== 'undefined') {
          rowData['BinList'].push(rowData['Bin']);
        }
      }
    }

    function mergeRows(targetRow, sourceRow) {
      //Combine bins into a single array of values.
      //The bin array may include undefined items for some
      // wines, but the length of the array still indicates
      // the quantity.
      if (typeof sourceRow['Bin'] !== 'undefined') {
        targetRow['BinList'].push(sourceRow['Bin']);
      }
    }

    function mergeRowIntoDatasets(rowData) {
      var existingRow;

      existingRow = rowDataset[rowData['iWine']];
      if (!existingRow) {
        prepareRow(rowData);
        rowDataset[rowData['iWine']] = rowData;
        rowDataArray.push(rowData);
      } else {
        mergeRows(existingRow, rowData);
      }

    }

    function parseRawData() {
      var root,
          row,
          rowData,
          rowElements,
          rowIndex;

      if (rawDataXML) {
        root = rawDataXML.documentElement;
      }

      if (root) {
        rowElements = root.getElementsByTagName("row");
      }

      rowDataset = {};
      if (rowElements) {
          for (rowIndex = 0; rowIndex < rowElements.length; rowIndex++) {
            row = rowElements[rowIndex];
            rowData = rowDataFromXML(row);
            mergeRowIntoDatasets(rowData);
          }
      }
    }

    function arrayMap(a, mapping) {
      var result;
      result = mapping.indexOf(a)
      if (result === -1) {
        result = mapping.length;
      }
      return result;
    }

    function compare(a, b, valueMapFunction) {
      var aValue, bValue;
      aValue = valueMapFunction.call(this, a);
      bValue = valueMapFunction.call(this, b);
      return aValue - bValue;
    }

    function mapType(rowData) {
      var typeOrder = [
        'Sparkling, Rosé, and White Wines',
        'Red Wines',
        'Dessert Wines',
        'Other'
      ]

      return arrayMap(rowData['TypeGroup'], typeOrder);
    }

    function compareType(a, b) {
      return compare(a, b, mapType);
    }

    function mapVarietalType(rowData) {
      var varietalTypeMap = {};
      varietalTypeMap['White - Sparkling'] = 1;
      varietalTypeMap['Rosé - Sparkling'] = 1;
      varietalTypeMap['Red - Sparkling'] = 1;
      varietalTypeMap['Rosé'] = 2;
      varietalTypeMap['White'] = 3;
      varietalTypeMap['White - Off-dry'] = 3;
      varietalTypeMap['Red'] = 4;
      varietalTypeMap['White - Sweet/Dessert'] = 5;
      varietalTypeMap['Rosé - Sweet/Dessert'] = 5;
      varietalTypeMap['Red - Sweet/Dessert'] = 6;
      varietalTypeMap['White - Fortified'] = 5;
      varietalTypeMap['Red - Fortified'] = 6;
      varietalTypeMap['Fruit/Vegetable Wine'] = 7;
      varietalTypeMap['Sake'] = 7;
      varietalTypeMap['Spirits'] = 7;
      varietalTypeMap['Liqueur'] = 7;
      varietalTypeMap['Non-alcoholic'] = 7;

      return varietalTypeMap[rowData['Type']];
    }

    function compareVarietalType(a, b) {
      return compare(a, b, mapVarietalType);
    }

    function compareValues(a, b, key) {
      return a[key].localeCompare(b[key]);
    }

    function renderLegend(legendDataArray) {
      var i,
        legendEl,
        legendItemEl;

      legendEl = $('<div>').addClass('legend');

      legendDataArray.sort();
      for (i = 0; i < legendDataArray.length; i++) {
        legendItemEl = $('<div>')
          .addClass(mapLocationToCategoryClass(legendDataArray[i]))
          .text(legendDataArray[i])
          .appendTo(legendEl);
      }

      return legendEl;
    }

    function compareWineRows(a, b) {
      var result;

      result = compareType(a, b);
      if (result !== 0 ) {
        return result;
      }

      result = compareVarietalType(a, b);
      if (result !== 0 ) {
        return result;
      }

      result = compareValues(a, b, 'VarietalGroup');
      if (result !== 0 ) {
        return result;
      }

      result = compareValues(a, b, 'SortProducer');
      if (result !== 0 ) {
        return result;
      }

      result = compareValues(a, b, 'Wine');
      if (result !== 0 ) {
        return result;
      }

      return result;
    }

    function mapLocationToCategoryClass(location) {
      var locationMap = {};
      locationMap['Wine Fridge'] = 'category-normal';
      locationMap['Wine Fridge - Reserve'] = 'category-reserve';
      locationMap['Wine Fridge - House'] = 'category-house';

      return locationMap[location];
    }

    function renderWineList() {
      var binCount,
        binEl,
        binIndex,
        categoryClass,
        currentBinList,
        i,
        legendDataset,
        legendDataArray,
        localeAbbreviated,
        location,
        previousTypeGroup,
        previousVarietalGroup,
        price,
        typeGroup,
        varietalGroup,
        wineEl,
        wineCellEl,
        wineGroupEl,
        wineListEl,
        wineWrapperEl;

      legendDataset = {};
      legendDataArray = [];

      //Main container for wine and legend information
      wineListEl = $('<div>').addClass('wine-list');

      rowDataArray.sort(compareWineRows);

      for (i = 0; i < rowDataArray.length; i++) {
        //Cell container for everything related to this wine
        wineCellEl = $('<td>');

        //Type heading if the type is different than the previous wine
        typeGroup = rowDataArray[i]['TypeGroup'];
        if (previousTypeGroup !== typeGroup) {
          previousTypeGroup = typeGroup;

          //Type groups nest inside the main container
          wineGroupEl = $('<div>')
            .addClass('type-group')
            .appendTo(wineListEl);

          //Type headings appear at the top of the wine cell container
          $('<div>')
            .addClass('type-heading')
            .text(typeGroup)
            .appendTo(wineCellEl);
        }

        //Varietal heading if the varietal is different than the preivous wine
        varietalGroup = rowDataArray[i]['VarietalGroup'];
        if (previousVarietalGroup !== varietalGroup) {
          previousVarietalGroup = varietalGroup;

          $('<div>')
            .addClass('varietal-heading')
            .text(varietalGroup)
            .appendTo(wineCellEl);
        }

        //This wine's vintage, name, locale, and bottle note
        nameAndLocale = $('<span>').addClass('wine-name-and-locale');

        if (rowDataArray[i]['Vintage'] !== '1001') {
          $('<span>')
            .addClass('vintage')
            .text(rowDataArray[i]['Vintage'])
            .appendTo(nameAndLocale)
            .after(' ');
        }

        $('<a>')
          .addClass('wine-name')
          .attr('href', 'https://www.cellartracker.com/wine.asp?iWine=' + rowDataArray[i]['iWine'])
          .text(rowDataArray[i]['Wine'])
          .appendTo(nameAndLocale)
          .after(' ');

        localeAbbreviated = rowDataArray[i]['LocaleAbbreviated'].replace(/(,)? /g, function($0, $1) { return $1 ? $0 : nonBreakingSpace; });
        $('<span>')
          .addClass('locale')
          .text('(' + localeAbbreviated + ')')
          .appendTo(nameAndLocale);

        if (rowDataArray[i]['BottleNote']) {
          $('<span>')
            .addClass('bottle-note')
            .text(rowDataArray[i]['BottleNote'])
            .appendTo(nameAndLocale)
            .before('<br>');
        }

        //This wine's bins and price
        binAndPriceList = $('<span>').addClass('bin-and-price-list');

        currentBinList = rowDataArray[i]['BinList'];
        binCount = currentBinList.length;

        for (binIndex = 0; binIndex < binCount; binIndex++) {
          binEl = $('<a>')
            .addClass('bin')
            .attr('href', 'https://www.cellartracker.com/barcode.asp?iWine=' + rowDataArray[i]['iWine'] + '&Size=' + encodeURIComponent(rowDataArray[i]['Size']) + '&Location=' + encodeURIComponent(rowDataArray[i]['Location']) + '&Bin=' + encodeURIComponent(currentBinList[binIndex]))
            .text(currentBinList[binIndex])
            .appendTo(binAndPriceList);

          if (binIndex !== (binCount - 1)) {
            binEl.after(', ');
          }
        }

        price = Math.ceil(parseFloat(rowDataArray[i]['Price']));

        if (binCount > 0 && price !== 0) {
          $('<span>')
            .addClass('price-list-item')
            .text(", ")
            .appendTo(binAndPriceList);
        }

        if (price !== 0) {
          $('<span>')
            .addClass('price')
            .addClass('price-list-item')
            .text('$' + price)
            .appendTo(binAndPriceList);
        }

        //Container for information specific to this wine (i.e. not headers)
        wineEl = $('<div>')
          .addClass('wine');

        location = rowDataArray[i]['Location'];
        categoryClass = mapLocationToCategoryClass(location);
        if (categoryClass) {
          wineEl.addClass(categoryClass);

          //Record this class for use in the legend later
          if (!legendDataset[location]) {
            legendDataset[location] = categoryClass;
            legendDataArray.push(location);
          }
        }

        wineEl.append(nameAndLocale);
        wineEl.append(binAndPriceList);

        wineCellEl.append(wineEl);

        //Wrapper to accommodate layout
        wineWrapperEl = $('<table>')
          .addClass('avoid-break');

        wineCellEl.appendTo('<tr>')
          .appendTo('<tbody>')
          .appendTo(wineWrapperEl);

        //Wrappers nest inside the type group
        wineGroupEl.append(wineWrapperEl);
      }

      wineListEl.append(renderLegend(legendDataArray));

      return wineListEl;
    }

    function processRawData() {
      var wineListEl;
          
      parseRawData();
      wineListEl = renderWineList();
      $('#wine-list-wrapper').append(wineListEl);
    }

    function getResponseErrorMessage(response) {
      var root,
        body;

      if (response) {
        root = response.documentElement;
      }

      //An HTML response from CellarTracker indicates an error, stored in the body element.
      if (root && root.localName == "html" && root.namespaceURI === null) {
        body = root.firstChild;
        if (body && body.localName == "body" && body.namespaceURI === null) {
          return body.textContent;
        }
      } else if (!root) {
        return 'An error occured while accessing CellarTracker. There was no data in the response.'
      }

      return;
    }

    function isLoginErrorResponse(response) {
      var responseErrorMessage;

      responseErrorMessage = getResponseErrorMessage(response);
      if (responseErrorMessage == "You are currently not logged into CellarTracker.") {
        return true;
      }

      return false;
    }

    function loadRawDataUsingXHR(credentials, callback) {
      rawDataURL = "http://www.cellartracker.com/classic/xlquery.asp?table=Inventory&User=" + credentials.user + "&Password=" + credentials.password + "&Format=xml";
      getXMLAsyncXHR(rawDataURL, function (response) {
        rawDataXML = response;
        
        if (isLoginErrorResponse(response)) {
          alert("There was an error logging in. Please visit CellarTracker to confirm that your handle and password are correct.");
          callback.call(this, credentials, false);
        } else {
          callback.call(this, credentials, true);
        }
      });
    }
    
    function updatePageUri(newUri) {
      window.onpopstate = function () {
        queryString = getRawQueryString();
        loadWineListWithQueryStringCredentials();
      };

      window.history.pushState(null, 'Wine List', newUri);
      queryString = getRawQueryString();
    }

    function updatePageState(credentials, succeeded) {
      var queryCredentials,
          newUri;

      queryCredentials = getCredentialsFromQueryString();

      CellarView.ProgressAnimation.stop();
      
      if (succeeded) {
        setSpinnerCompleted(true);
        setProgressStatus('Formatting data');
        
        setTimeout(function () {
          processRawData();
          showWineList();
          updateLayout();
          
          if (queryCredentials.user !== credentials.user || queryCredentials.password !== credentials.password) {
            updatePageUri("?User=" + encodeURIComponent(credentials.user) + "&Password=" + encodeURIComponent(credentials.password));
          }
          
        }, 200);

      } else {
        showMainContent();

        if (queryCredentials.user || queryCredentials.password) {
          updatePageUri('?');
        }
      }
    }

    function loadWineList(credentials) {
      var succeeded;

      if (credentials.user && credentials.password) {
        setProgressStatus('Downloading data' + ellipsis);
        showProgress();
        CellarView.ProgressAnimation.start();
        
        loadRawDataUsingXHR(credentials, updatePageState);
        
      } else {
        updatePageState(credentials, succeeded);
      }
    }

    return {
      init: function () {
        var dataCleanupXML,
          dataPresentationXML,
          parser;

        queryString = getRawQueryString();
        
        if (getHidePricesFromQueryString()) {
          addClass('wine-list-wrapper', 'hide-prices');
        }

        if (getIsTwoColumnLayoutFromQueryString()) {
          addClass('wine-list-wrapper', 'two-column');
        }
        
        parser = new DOMParser();

        window.onresize = (function () {
          var resizeTimeoutId;
          
          return function () {
            window.clearTimeout(resizeTimeoutId);
            resizeTimeoutId = window.setTimeout(updateLayout, 10);
          };
        })();
      },

      loadWineListWithQueryStringCredentials: function () {
        var credentials;

        credentials = getCredentialsFromQueryString();
        loadWineList(credentials);
      },

      loadWineListWithFormCredentials: function () {
        var credentials;

        credentials = getCredentialsFromForm();

        if (credentials.user && credentials.password) {
          loadWineList(credentials);

        } else {
          alert("A CellarTracker handle and password are required.");
          updatePageState(credentials, false);
        }
      }

    }
  })();

})();