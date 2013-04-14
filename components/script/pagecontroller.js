(function () {

  CellarView.PageController = {};

  CellarView.PageController.loadWineList = function () {
    CellarView.Transform.init();
    CellarView.Transform.loadWineListWithQueryStringCredentials();
  };

  CellarView.PageController.handleCredentialsFormSubmit = function (e) {
    e.preventDefault();
    CellarView.Transform.loadWineListWithFormCredentials();
  };

})();