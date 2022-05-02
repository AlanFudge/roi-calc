"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var roiCalculator = /*#__PURE__*/function () {
  function roiCalculator(elementSelector, options) {
    _classCallCheck(this, roiCalculator);

    var defaultOptions = {
      revPerBedPerDay: 270,
      insourcedBillRate: 0.0065,
      billingRate: 0.03,
      collectionRate: 0.98
    };
    this.options = Object.assign({}, defaultOptions, options);
    this.occupancyRate = 85;
    this.numOfHomes = 10;
    this.bedsPerHome = 90;
    this.insourcedCollectionsRate = .90;
    this.formElement = document.querySelector(elementSelector);
    /*
        inject HTML into document here
          this.injectForm();
          will need to have an empty div with enough attributes to use query selector
    */

    this.emailInput = document.querySelector("".concat(elementSelector, " .roi-calc-input-wrapper input[type=email]"));
    this.modal = document.querySelector("".concat(elementSelector, " .roi-calc-modal-wrapper"));
    this.modalInsourcedValues = document.querySelectorAll("".concat(elementSelector, " .roi-calc-modal-results .insourced span"));
    this.modalOutsourcedValues = document.querySelectorAll("".concat(elementSelector, " .roi-calc-modal-results .outsourced span")); // this.modalDeltaValues = document.querySelectorAll(`${elementSelector} .roi-calc-modal-results .delta span`);

    this.modalDeltaNetCollectionsValue = document.querySelector("".concat(elementSelector, " .delta-bar span"));
    this.modalTotalROIValue = document.querySelector("".concat(elementSelector, " .roi-calc-modal-results .roi span"));
    this.modalInsourcedBar = document.querySelector("".concat(elementSelector, " .insourced-bar"));
    this.modalDeltaBar = document.querySelector("".concat(elementSelector, " .delta-bar"));
    this.closeModalButton = document.querySelector("".concat(elementSelector, " .close-modal"));
    this.closeModalButton.onclick = this.closeModal.bind(this);
    this.sendEmailToHubspot = this.sendEmailToHubspot.bind(this);
    this.formElement.onsubmit = this.handleSubmit.bind(this);
  }

  _createClass(roiCalculator, [{
    key: "injectForm",
    value: function injectForm() {
      this.formElement.innerHTML = //once design is finalized this should be changed to the needed HTML
      "<form>\n                <h1>Hello World</h1>\n            </form>";
    }
  }, {
    key: "abbreviateDollarValue",
    value: function abbreviateDollarValue(num) {
      if (num >= 1000000) {
        return "".concat((num / 1000000).toLocaleString(), "M");
      }

      if (num >= 1000) {
        return "".concat((num / 1000).toLocaleString(), "K");
      }

      return "".concat(num.toLocaleString());
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(e) {
      var _this = this;

      e.preventDefault();
      this.sendEmailToHubspot(); // inputs from user [number of homes, billing rate, collections rate, email] excludes submit input;

      var _Object$values$slice$ = Object.values(e.target).slice(0, -1).map(function (node) {
        return Number.parseFloat(node.value);
      });

      var _Object$values$slice$2 = _slicedToArray(_Object$values$slice$, 4);

      this.numOfHomes = _Object$values$slice$2[0];
      this.bedsPerHome = _Object$values$slice$2[1];
      this.occupancyRate = _Object$values$slice$2[2];
      this.insourcedCollectionsRate = _Object$values$slice$2[3];
      this.occupancyRate = this.occupancyRate / 100;
      this.insourcedCollectionsRate = this.insourcedCollectionsRate / 100;

      var _this$calculateResult = this.calculateResults(),
          _this$calculateResult2 = _slicedToArray(_this$calculateResult, 4),
          insourcedResults = _this$calculateResult2[0],
          outsourcedResults = _this$calculateResult2[1],
          deltaResults = _this$calculateResult2[2],
          roi = _this$calculateResult2[3];

      this.modalInsourcedValues.forEach(function (element, i) {
        element.innerText = _this.abbreviateDollarValue(insourcedResults[i]);
      });
      this.modalOutsourcedValues.forEach(function (element, i) {
        element.innerText = _this.abbreviateDollarValue(outsourcedResults[i]);
      }); // this.modalDeltaValues.forEach((element, i) => {
      //     element.innerText = `$${(Math.ceil(deltaResults[i]) / 1000).toLocaleString()}K`;
      // });
      // swapped below out for above for requested bar graph

      this.modalDeltaNetCollectionsValue.innerText = this.abbreviateDollarValue(deltaResults[2]);
      var percentageIncrease = Math.round((outsourcedResults[3] - insourcedResults[3]) / insourcedResults[3] * 100);
      this.modalDeltaBar.style.width = '30%';
      this.modalDeltaBar.style.width = "".concat(30 + percentageIncrease, "%");

      if (percentageIncrease > 55) {
        this.modalInsourcedBar.style.width = '5%';
        this.modalDeltaBar.style.width = "".concat(5 + percentageIncrease, "%");
      }

      if (percentageIncrease > 85) this.modalDeltaBar.style.width = '85%';
      this.modalTotalROIValue.innerHTML = "<em>".concat(roi / 100, "X</em> ROI"); // open modal

      this.modal.style.display = 'flex';
      return false;
    }
  }, {
    key: "closeModal",
    value: function closeModal(e) {
      e.preventDefault();
      return this.modal.style.display = 'none';
      roundToNearestMagnitude;
    }
  }, {
    key: "calculateResults",
    value: function calculateResults() {
      var submittedClaims = this.numOfHomes * this.bedsPerHome * this.occupancyRate * this.options.revPerBedPerDay;

      var roundToNearestMagnitude = function roundToNearestMagnitude(num) {
        if (num >= 1000000) {
          return Math.round(num / 1000000) * 1000000;
        }

        if (num >= 1000) {
          return Math.round(num / 1000) * 1000;
        }

        return num;
      }; //arrays hold [billing costs, gross collections, net collections] in that order


      var insourced = [submittedClaims, submittedClaims * this.insourcedCollectionsRate, submittedClaims * this.options.insourcedBillRate, submittedClaims * this.insourcedCollectionsRate - submittedClaims * this.options.insourcedBillRate].map(roundToNearestMagnitude);
      var assembly = [submittedClaims, submittedClaims * this.options.collectionRate, submittedClaims * this.options.billingRate, submittedClaims * this.options.collectionRate - submittedClaims * this.options.billingRate].map(roundToNearestMagnitude);
      var delta = [assembly[1] - insourced[1], assembly[2] - insourced[2], assembly[3] - insourced[3]];
      var roi = Math.round(delta[0] / delta[1] * 100);
      return [insourced, assembly, delta, roi];
    }
  }, {
    key: "sendEmailToHubspot",
    value: function sendEmailToHubspot() {
      var requestBody = {
        submittedAt: Date.now(),
        legalConsentOptions: {
          consent: {
            consentToProcess: true,
            text: "I agree to allow QHCR to store and process my personal data.",
            communications: [{
              value: true,
              subscriptionTypeId: 999,
              text: "I agree to receive marketing communications from QHCR."
            }]
          }
        },
        fields: [{
          objectTypeId: "0-1",
          name: "email",
          value: this.emailInput.value
        }]
      };
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/20893444/6c83b0bd-f3cf-408d-b101-24bb5893f734', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    }
  }]);

  return roiCalculator;
}();

var myROI = new roiCalculator('#roi-calc');
