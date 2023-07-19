import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.localStorage = localStorage
    this.icon = this.document.querySelectorAll(`div[data-testid="icon"]`)
    this.document.querySelector(`button[data-testid="btn-new-bill"]`)
    this.iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`)
    this.handleClickNewBill = this.handleClickNewBill
    this.document.addEventListener('click', this.handleClickNewBill)
    this.handleClickIconEye = this.handleClickIconEye
    this.document.addEventListener('click', this.handleClickIconEye)
    this.onNavigate(ROUTES_PATH['Dashboard'])
    $('#modaleFile')
    
    const buttonNewBill = this.document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) this.document.addEventListener('click', this.handleClickNewBill)
    const iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) {
      this.iconEye.forEach(icon => {
        icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })}
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($('#modaleFile').outerWidth() * 0.5);
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)    
    $('#modaleFile').addClass('show');
  };

  getBills = async () => {
    if (!this.store) {
      return this.store.bills().list();
    }
  
    try {
      const snapshot = await this.store;
      const bills = snapshot.map(doc => {
        try {
          return {
            ...doc,
            date: formatDate(doc.date),
            status: formatStatus(doc.status)
          };
        } catch (err) {
          console.log(err, 'for', doc);
          return {
            ...doc,
            date: doc.date,
            status: formatStatus(doc.status)
          };
        }
      });
      console.log('length', bills.length);
      return bills;
    } catch (err) {
      console.log(err);
      return [];
    }
  };
}
  
  

