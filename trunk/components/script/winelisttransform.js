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

    function getXMLSynchronousXHR(url) {
      var req;

      req = new XMLHttpRequest();
      req.open('GET', url, false);
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

    function loadCredentialsFromQueryString() {
      return {
        user: queryString["user"],
        password: queryString["password"]
      };
    }

    function loadCredentialsFromForm() {
      return {
        user: el('user-input').value,
        password: el('password-input').value
      };
    }

    function init() {
      var parser,
          dataCleanupXML,
          dataPresentationXML;

      queryString = getRawQueryString();

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
      el('html-display').innerHTML = presentationHTML.body.innerHTML;
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

    function showCredentialsPrompt() {
      el('credentials-prompt').style.display = "block";
    }

    function hideCredentialsPrompt() {
      el('credentials-prompt').style.display = "none";
    }

    function updatePageState(credentials, succeeded) {
      var queryCredentials,
          newUri;

      queryCredentials = loadCredentialsFromQueryString();

      if (succeeded) {
        hideCredentialsPrompt();
        processRawData();

        if (queryCredentials.user !== credentials.user || queryCredentials.password !== credentials.password) {
          newUri = "?User=" + encodeURIComponent(credentials.user) + "&Password=" + encodeURIComponent(credentials.password);
        }

      } else {
        showCredentialsPrompt();

        if (queryCredentials.user || queryCredentials.password) {
          newUri = "?";
        }
      }

      if (newUri) {
        window.history.pushState(null, 'Wine List', newUri);
      }
    }

    function loadWineList(credentials) {
      var succeeded;

      if (credentials.user && credentials.password) {
        succeeded = loadRawDataUsingXHR(credentials);
      }

      updatePageState(credentials, succeeded);
    }

  WineListTransform = {

    loadWineList: function () {
      var credentials;

      init();

      credentials = loadCredentialsFromQueryString();
      loadWineList(credentials);
    },

    reloadWithFormCredentials: function () {
      var credentials;

      credentials = loadCredentialsFromForm();

      if (credentials.user && credentials.password) {
        loadWineList(credentials);

      } else {
        alert("A CellarTracker handle and password are required.");
        updatePageState(credentials, succeeded);
      }
    }

  };

})();
