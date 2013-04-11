var WineListTransform;

(function () {

    function getDataCleanupText() {
      var t;
      return t;
    }

    function getDataPresentationText() {
      var t;
      return t;
    }

    var queryString,
        dataCleanupProcessor,
        dataPresentationProcessor,
        rawDataURL,
        rawDataXML;

    function el(id) {
      return document.getElementById(id);
    }

    // Assumes el is an Element
    function wrapElementCore(tagName, el) {
      var parent,
        root;
      
      root = el.parentNode;
      parent = document.createElement(tagName);
      root.insertBefore(parent, el);
      parent.appendChild(el);
      
      return parent;
    }

    function wrapElement(tagName, el) {
      var i,
        previousEl,
        length,
        parent;
      
      if (el instanceof Array || el instanceof NodeList) {
        
        length = el.length;
        
        // Iterate in reverse order sine the NodeList may be live updating.
        if (length > 0) {
          previousEl = el[length - 1];
          parent = wrapElementCore(tagName, previousEl);
          for (i = length - 2; i >= 0; i--) {
            parent.insertBefore(el[i], previousEl);
            previousEl = el[i];
          }
        }
        
      } else {
        parent = wrapElementCore(tagName, el);
      }
      
      return parent;
    }

    function wrapElementsToAvoidBreak(el) {
      var dataEl,
        rowEl,
        tableEl,
        bodyEl;
      
      dataEl = wrapElement('td', el);
      rowEl = wrapElement('tr', dataEl);
      bodyEl = wrapElement('tbody', rowEl);
      tableEl = wrapElement('table', bodyEl);
      tableEl.className = "avoid-break";
      
      return tableEl;
    }

    function getSingleElementByClassName(el, name) {
      var list;
      
      list = el.getElementsByClassName(name);
      if (list.length === 1) {
        return list[0];
      }
    }

    function getNameMaxWidthFromContents(wineEl) {
      var binEl;
      
      binEl = getSingleElementByClassName(wineEl, 'bin-and-price-list');
      return (wineEl.offsetWidth - binEl.offsetWidth) + 'px';
      
    }

    function updateWineLayout(wineEl, nameMaxWidth) {
      var binEl,
        localeEl,
        nameEl,
        wineMinHeight;
        
      //nameEl = getSingleElementByClassName(wineEl, 'wine-name-and-locale');
      //nameEl.style.maxWidth = nameMaxWidth;
      
      binEl = getSingleElementByClassName(wineEl, 'bin-and-price-list');
      wineEl.style.minHeight = binEl.offsetHeight + 'px';
      
      localeEl = getSingleElementByClassName(wineEl, 'locale');
      //Mimic negative lookbehind. See http://blog.stevenlevithan.com/archives/mimic-lookbehind-javascript
      localeEl.innerHTML = localeEl.innerHTML.replace(/(,)? /g, function($0, $1){
        return $1 ? $0 :  '&nbsp;';
      });
      
      // Hack for "column-break-inside: avoid;" support in Mozilla
      wrapElementsToAvoidBreak(wineEl.childNodes);
      
    }

    function updateAllWineLayout() {
      var i,
        length,
        nameMaxWidth,
        wineNodes;
      
      wineNodes = el('wine-list').getElementsByClassName('wine');
      length = wineNodes.length;
      
      if (length > 0) {
        nameMaxWidth = getNameMaxWidthFromContents(wineNodes[0]);
        
        for (i = 0; i < length; i++) {
          updateWineLayout(wineNodes[i], nameMaxWidth);
        }
        
      }
      
    }

    function updateAllHeadingLayout(headingClassName) {
      var i,
        length,
        nodes;
      
      nodes = el('wine-list').getElementsByClassName(headingClassName);
      length = nodes.length;
      
      for (i = 0; i < length; i++) {
        // Hack for "column-break-inside: avoid;" support in Mozilla
        wrapElementsToAvoidBreak([nodes[i], nodes[i].nextSibling]);
      }
      
    }

    function updateLayout() {
      updateAllWineLayout();
      updateAllHeadingLayout('varietal-heading');
      updateAllHeadingLayout('type-heading');
    }

    function getXMLSynchronousXHR(url) {
      var req;

      req = new XMLHttpRequest();
      req.open('GET', url, false);
      //req.setRequestHeader('encoding', 'utf-8');
      //req.overrideMimeType("text/xml; charset=utf-8");
      req.send(null);
      if (!(req.status == 200 || req.status == 0)) {
        return null;
      } else {
        return req.responseXML;
      }
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

    function init() {
      var dataCleanupXML,
        dataPresentationXML,
        hidePricesParam,
        parser;

      queryString = getRawQueryString();
      hidePricesParam = queryString['hideprices'];
      if (typeof hidePricesParam !== "undefined") {
        if (hidePricesParam.toLowerCase() === 'true' || hidePricesParam === '1') {
          el('wine-list').className += ' ' + 'hide-prices';
        }
      }

      parser = new DOMParser();

      dataCleanupXML = parser.parseFromString(getDataCleanupText(), "text/xml");
      dataCleanupProcessor = new XSLTProcessor();
      dataCleanupProcessor.importStylesheet(dataCleanupXML);

      dataPresentationXML = parser.parseFromString(getDataPresentationText(), "text/xml");
      dataPresentationProcessor = new XSLTProcessor();
      dataPresentationProcessor.importStylesheet(dataPresentationXML);
    }

    function processRawData() {
      var cleanDataXML,
          presentationHTML;

      cleanDataXML = dataCleanupProcessor.transformToDocument(rawDataXML);
      presentationHTML = dataPresentationProcessor.transformToDocument(cleanDataXML);
      el('wine-list').innerHTML = presentationHTML.body.innerHTML;
      updateLayout();
    }

    function getResponseErrorMessage(response) {
      var root,
          body;

      root = rawDataXML.documentElement;

      //An HTML response from CellarTracker indicates an error, stored in the body element.
      if (root && root.localName == "html" && root.namespaceURI === null) {
        body = root.firstChild;
        if (body && body.localName == "body" && body.namespaceURI === null) {
          return body.textContent;
        }
      }

      return;
    }

    function isLoginErrorResponse(response) {
      var responseErrorMessage;

      responseErrorMessage = getResponseErrorMessage(rawDataXML);
      if (responseErrorMessage == "You are currently not logged into CellarTracker.") {
        return true;
      }

      return false;
    }

    function loadRawDataUsingXHR(credentials) {
      rawDataURL = "http://www.cellartracker.com/xlquery.asp?table=List&Location=1&User=" + credentials.user + "&Password=" + credentials.password + "&Format=xml";
      rawDataXML = getXMLSynchronousXHR(rawDataURL);

      if (isLoginErrorResponse(rawDataXML)) {
        alert("There was an error logging in. Please visit CellarTracker to confirm that your handle and password are correct.");
        return false;
      }

      return true;
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

    function setWineListVisible(visible) {
      setBlockElementVisible('wine-list', visible);
    }

    function showMainContent() {
      setMainContentVisible(true);
      setWineListVisible(false);
    }

    function showWineList() {
      setMainContentVisible(false);
      setWineListVisible(true);
    }

    function updatePageState(credentials, succeeded) {
      var queryCredentials,
          newUri;

      queryCredentials = getCredentialsFromQueryString();

      if (succeeded) {
        showWineList();
        processRawData();

        if (queryCredentials.user !== credentials.user || queryCredentials.password !== credentials.password) {
          newUri = "?User=" + encodeURIComponent(credentials.user) + "&Password=" + encodeURIComponent(credentials.password);
        }

      } else {
        showMainContent();

        if (queryCredentials.user || queryCredentials.password) {
          newUri = "?";
        }
      }

      if (newUri) {
        window.onpopstate = function () {
          queryString = getRawQueryString();
          loadWineListWithQueryStringCredentials();
        };

        window.history.pushState(null, 'Wine List', newUri);
        queryString = getRawQueryString();
      }
    }

    function loadWineList(credentials) {
      var succeeded;

      if (credentials.user && credentials.password) {
        succeeded = loadRawDataUsingXHR(credentials);
      }

      updatePageState(credentials, succeeded);

      return succeeded;
    }

    function loadWineListWithQueryStringCredentials() {
      var credentials;

      credentials = getCredentialsFromQueryString();
      loadWineList(credentials);
    }

    function loadWineListWithFormCredentials() {
      var credentials;

      credentials = getCredentialsFromForm();

      if (credentials.user && credentials.password) {
        loadWineList(credentials);

      } else {
        alert("A CellarTracker handle and password are required.");
        updatePageState(credentials, false);
      }
    }

  WineListTransform = {

    loadWineList: function () {
      init();
      loadWineListWithQueryStringCredentials();
    },

    handleCredentialsFormSubmit: function (e) {
      e.preventDefault();
      loadWineListWithFormCredentials();
    }

  };

})();
