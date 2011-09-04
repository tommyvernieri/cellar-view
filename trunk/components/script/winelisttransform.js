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
      if (!(req.status == 200 || req.status == 0)) return null;
      else return req.responseXML;
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

    function init() {
      var parser,
          dataCleanupXML,
          dataPresentationXML;

      queryString = getRawQueryString();
      rawDataURL = "http://www.cellartracker.com/xlquery.asp?table=List&Location=1&User=" + queryString["user"] + "&Password=" + queryString["password"] + "&Format=xml";

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
      el('htmldisplay').innerHTML = presentationHTML.body.innerHTML;
    }

    function loadAndProcessRawDataUsingXHR() {
      rawDataXML = getXMLSynchronousXHR(rawDataURL);
      processRawData();
    }

  WineListTransform = {
  
    loadWineList: function () {
      init();
      loadAndProcessRawDataUsingXHR();
    }
    
  };

})();
