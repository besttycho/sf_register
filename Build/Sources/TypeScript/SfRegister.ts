import PasswordStrengthCalculator from './PasswordStrengthCalculator';

interface SelectOption {
  label: string,
  value: string,
}

const document = window.document;

export default class SfRegister {
  public loading: boolean = false;
  public ajaxRequest: XMLHttpRequest = null;
  public barGraph:HTMLMeterElement = null;
  public passwordStrengthCalculator:PasswordStrengthCalculator = null;
  public zone:HTMLSelectElement = null;
  public zoneEmpty:HTMLElement = null;
  public zoneLoading:HTMLElement = null;

  constructor() {
    // Attach content loaded element with callback to document
    document.addEventListener('DOMContentLoaded', this.contentLoaded.bind(this));
  }

  /**
   * Callback after content was loaded
   */
  contentLoaded(this: SfRegister) {
    this.zone = (document.getElementById('sfrZone') as HTMLSelectElement);
    this.zoneEmpty = document.getElementById('sfrZone_empty');
    this.zoneLoading = document.getElementById('sfrZone_loading');

    this.barGraph = (document.getElementById('bargraph') as HTMLMeterElement);
    if (this.barGraph) {
      this.barGraph.classList.add('show');
      this.passwordStrengthCalculator = new PasswordStrengthCalculator();
      this.attachToElementById('sfrpassword', 'keyup', this.callTestPassword.bind(this));
    }

    this.attachToElementById('sfrCountry', 'change', this.countryChanged.bind(this));
    this.attachToElementById('sfrCountry', 'keyup', this.countryChanged.bind(this));
    this.attachToElementById('uploadButton', 'change', this.uploadFile.bind(this));
    this.attachToElementById('removeImageButton', 'click', this.removeFile.bind(this));
  }

  /**
   * Add class d-block remove class d-none
   */
  showElement(element: HTMLElement) {
    element.classList.remove('d-none');
    element.classList.add('d-block');
  }

  /**
   * Add class d-none remove class d-block
   */
  hideElement(element: HTMLElement) {
    element.classList.remove('d-block');
    element.classList.add('d-none');
  }

  attachToElementById(id: string, eventName: string, callback: EventListenerOrEventListenerObject) {
    const element = document.getElementById(id);
    this.attachToElement(element, eventName, callback);
  }

  attachToElement(element: HTMLElement, eventName: string, callback: EventListenerOrEventListenerObject) {
    if (element) {
      element.addEventListener(eventName, callback);
    }
  }

  /**
   * Gets password meter element and sets the value with
   * the result of the calculate password strength function
   */
  callTestPassword(this: SfRegister, event: Event) {
    const element = (event.target as HTMLInputElement),
      meterResult = this.passwordStrengthCalculator.calculate(element.value);

    if (this.barGraph.tagName.toLowerCase() === 'meter') {
      this.barGraph.value = meterResult.score;
    } else {
      const barGraph = (this.barGraph as unknown as HTMLIFrameElement),
        percentScore = Math.min((Math.floor(meterResult.score / 3.4)), 10),
        blinds = (
          barGraph.contentDocument || barGraph.contentWindow.document
        ).getElementsByClassName('blind');

      for (let index = 0; index < blinds.length; index++) {
        const blind = (blinds[index] as HTMLElement);
        if (index < percentScore) {
          this.hideElement(blind);
        } else {
          this.showElement(blind);
        }
      }
    }
  }

  loadCountryZonesByCountry(countrySelectedValue: string) {
    this.loading = true;

    this.zone.disabled = true;
    this.hideElement(this.zoneEmpty);
    this.showElement(this.zoneLoading);

    this.ajaxRequest = new XMLHttpRequest();
    this.ajaxRequest.onload = this.xhrReadyOnLoad.bind(this);
    this.ajaxRequest.open('POST', '/index.php?ajax=sf_register');
    this.ajaxRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    this.ajaxRequest.send('tx_sfregister[action]=zones&tx_sfregister[parent]=' + countrySelectedValue);
  }

  /**
   * Change value of zone selectbox
   */
  countryChanged(this: SfRegister, event: KeyboardEvent) {
    if (
      (
        event.type === 'change'
        || (event.type === 'keyup' && (event.keyCode === 40 || event.keyCode === 38))
      )
      && this.loading !== true
    ) {
      if (this.zone) {
        const target = ((event.target || event.srcElement) as HTMLSelectElement),
          countrySelectedValue = target.options[target.selectedIndex].value;

        this.loadCountryZonesByCountry(countrySelectedValue);
      }
    }
  }

  /**
   * Process ajax response and display error message or
   * hand data received to add zone option function
   */
  xhrReadyOnLoad(this: SfRegister, stateChanged: ProgressEvent) {
    const xhrResponse = (stateChanged.target as XMLHttpRequest);

    if (xhrResponse.readyState === 4 && xhrResponse.status === 200) {
      const xhrResponseData = JSON.parse(xhrResponse.responseText);
      this.hideElement(this.zoneLoading);

      if (xhrResponseData.status === 'error' || xhrResponseData.data.length === 0) {
        this.showElement(this.zoneEmpty);
      } else {
        this.addZoneOptions(xhrResponseData.data);
      }
    }

    this.loading = false;
  }

  /**
   * Process data received with xhr response
   */
  addZoneOptions(this: SfRegister, options: SelectOption[]) {
    while (this.zone.length) {
      this.zone.removeChild(this.zone[0]);
    }

    options.forEach((option: SelectOption, index: number) => {
      this.zone.options[index] = new Option(option.label, option.value);
    });

    this.zone.disabled = false;
  }

  /**
   * Adds a preview information about file to upload in a label
   */
  uploadFile(this: HTMLInputElement) {
    const information = document.getElementById('uploadFile');
    if (information) {
      (information as HTMLInputElement).value = this.value;
    }
  }

  /**
   * Handle remove image button clicked
   */
  removeFile() {
    const remove = document.getElementById('removeImage') as HTMLInputElement;
    if (remove) {
      remove.value = '1';
    }
    this.submitForm();
  }

  /**
   * Selects the form and triggers submit
   */
  submitForm() {
    const form = document.getElementById('sfrForm') as HTMLFormElement;
    if (form) {
      form.submit();
    }
  }
}
