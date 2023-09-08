import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.localStorage = localStorage
    const buttonNewBill = this.document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }
  // [1 - Bug report] - Le test Bills.js est au rouge/FAIL (src/__tests__/Bills.js) 
  // les notes de frais ne s'affichent pas par ordre décroissant.
  //===> Ajout de la méthode sort() pour trier les dates de manière décroissante 
  // les notes de frais s'affichent par ordre fonction de leurs dates 
  //.sort((a, b) => (a.date < b.date ? -1 : 1))

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .sort((a, b) => (a.date < b.date ? -1 : 1)) 
            .map(doc => {
              try {
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status)
                }
              } catch(e) {
                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                // log the error and return unformatted date in that case
                console.log(e,'for',doc)
                return {
                  ...doc,
                  date: formatDate(doc.date),
                  status: formatStatus(doc.status)
                }
              }
            })

          console.log('length', bills.length)
          console.log('bills', bills);
        return bills
      })
    }
  }
}
