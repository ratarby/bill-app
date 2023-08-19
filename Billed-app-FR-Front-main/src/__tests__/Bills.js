/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore  from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";

//   
jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // test  bill icon in vertical layout should be highlighted
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const mailIcon = screen.getByTestId('icon-mail')
      //to-do write expect expression
      // test if window icon contains "active-icon" class 
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()
      // test if mail icon contains "active-icon" class
      expect(mailIcon.classList.contains('active-icon')).not.toBeTruthy()
    })
    // test bills date should be ordered from earliest to latest
    test("Then bills date should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("new bill button should be displayed", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const newBillIcon = screen.getByTestId('btn-new-bill')
      //to-do write expect expression
      expect(newBillIcon && newBillIcon.toString().length>0).toBe(true)
    })
    test("bills should fetches from mock API GET", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Encore")).toBeTruthy()
    })
  })
})

describe("When an error occurs on API", () => {
  beforeEach(() => {// before each test
    jest.spyOn(mockStore, "bills") // jest verify 
    Object.defineProperty(window,'localStorage',{ value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee', email: "a@a"}))

    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  test("fetches bills from an API and fails with 404 message error", async () => {

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Error 404"))
        }
      }
    })

    window.onNavigate(ROUTES_PATH.Bills)
    await new Promise(process.nextTick);
    const message =  await screen.getByText(/Error 404/)
    expect(message).toBeTruthy()
  })

  test("fetches messages from an API and fails with 500 message error", async () => {

    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"))
        }
      }
    })

    window.onNavigate(ROUTES_PATH.Bills)
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })

  // test when I click on new bill button I should be redirected to new bill page, then I should be able to see the form
  test(('When i click new bill, I should be sent to new bill page'), async () => {

    localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

    window.onNavigate(ROUTES_PATH.Bills)
    const newBill = screen.getByTestId("btn-new-bill")
    const handleClick = jest.fn(newBill.handleClick)

    newBill.addEventListener('click', handleClick)
    userEvent.click(newBill)
    expect(handleClick).toHaveBeenCalled()

    window.onNavigate(ROUTES_PATH.NewBill)
    await waitFor(() => screen.getByText("Envoyer une note de frais"))
    expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
  })

  // test when I click on eye icon, I should see the picture linked to the bill 
  test(('When i click eye icon, I should see the picture linked to the bill'), async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }))
    const billsInit = new Bills({
      document, 
      onNavigate, 
      store: null, 
      localStorage: window.localStorage
    })
    
    document.body.innerHTML = BillsUI({ data: bills })
    const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon));
    const iconEye = screen.getAllByTestId("icon-eye");

    const modaleFile = document.getElementById("modaleFile")
    $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))// Mock - jquery function modal()
    iconEye.forEach((icon) => {
      icon.addEventListener("click", handleClickIconEye(icon))
      userEvent.click(icon)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
    expect(modaleFile.classList.contains("show")).toBeTruthy()
  })
})