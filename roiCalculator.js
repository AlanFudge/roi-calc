class roiCalculator {
    constructor(elementSelector, options) {
        const defaultOptions = {
            revPerBedPerDay: 270,
            insourcedBillRate: 0.0065,
            billingRate: 0.03,
            collectionRate: 0.98
        };
        this.options = Object.assign({}, defaultOptions, options);
        
        this.occupancyRate = 85
        this.numOfHomes = 10;
        this.bedsPerHome = 90;
        this.insourcedCollectionsRate = .90;
        
        this.formElement = document.querySelector(elementSelector);

        /*
            inject HTML into document here

            this.injectForm();

            will need to have an empty div with enough attributes to use query selector
        */

        this.modal = document.querySelector(`${elementSelector} .roi-calc-modal-wrapper`);
        this.modalInsourcedValues = document.querySelectorAll(`${elementSelector} .roi-calc-modal-results .insourced span`);
        this.modalOutsourcedValues = document.querySelectorAll(`${elementSelector} .roi-calc-modal-results .outsourced span`);
        this.modalDeltaValues = document.querySelectorAll(`${elementSelector} .roi-calc-modal-results .delta span`);
        this.modalTotalROIValue = document.querySelector(`${elementSelector} .roi-calc-modal-results .roi span`);

        this.closeModalButton = document.querySelector(`${elementSelector} .close-modal`);
        this.closeModalButton.onclick = this.closeModal.bind(this);

        this.formElement.onsubmit = this.handleSubmit.bind(this);
    }

    injectForm() {
        this.formElement.innerHTML = (
            //once design is finalized this should be changed to the needed HTML
            `<form>
                <h1>Hello World</h1>
            </form>`
        );
    }

    handleSubmit(e) {
        e.preventDefault();

        // Grab email in cms?

        // inputs from user [number of homes, billing rate, collections rate, email] excludes submit input;
        [this.numOfHomes, this.bedsPerHome, this.occupancyRate, this.insourcedCollectionsRate] = Object.values(e.target).slice(0, -1).map(node => Number.parseFloat(node.value));

        this.occupancyRate = this.occupancyRate / 100;
        this.insourcedCollectionsRate = this.insourcedCollectionsRate / 100;
        const [insourcedResults, outsourcedResults, deltaResults, roi] = this.calculateResults();

        this.modalInsourcedValues.forEach((element, i) => {
            element.innerText = `$${(Math.ceil(insourcedResults[i]) / 1000).toLocaleString()}K`;
        });
        this.modalOutsourcedValues.forEach((element, i) => {
            element.innerText = `$${(Math.ceil(outsourcedResults[i]) / 1000).toLocaleString()}K`;
        });
        this.modalDeltaValues.forEach((element, i) => {
            element.innerText = `$${(Math.ceil(deltaResults[i]) / 1000).toLocaleString()}K`;
        });
        this.modalTotalROIValue.innerText = `${roi / 100}X ROI`

        // open modal
        this.modal.style.display = 'flex';

        return false;
    }

    closeModal(e) {
        e.preventDefault();

        return this.modal.style.display = 'none';
    }

    calculateResults() {
        const submittedClaims = this.numOfHomes * this.bedsPerHome * this.occupancyRate * this.options.revPerBedPerDay;

        const roundToThousands = (num) => {
            return Math.round(num / 1000) * 1000;
        }

        //arrays hold [billing costs, gross collections, net collections] in that order
        const insourced = [
            submittedClaims,
            submittedClaims * this.insourcedCollectionsRate,
            submittedClaims * this.options.insourcedBillRate,
            (submittedClaims * this.insourcedCollectionsRate) - (submittedClaims * this.options.insourcedBillRate)
        ].map(roundToThousands);

        const assembly = [
            submittedClaims,
            submittedClaims * this.options.collectionRate,
            submittedClaims * this.options.billingRate,
            (submittedClaims * this.options.collectionRate) - (submittedClaims * this.options.billingRate)
        ].map(roundToThousands);

        const delta = [
            assembly[1] - insourced[1],
            assembly[2] - insourced[2],
            assembly[3] - insourced[3],
        ];

        const roi = Math.round((delta[0] / delta[1]) * 100);

        return [insourced, assembly, delta, roi];
    }
}

const myROI = new roiCalculator('#roi-calc');
