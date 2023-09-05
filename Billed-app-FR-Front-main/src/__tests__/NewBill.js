/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom" ;
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);


describe("Given I am connected as an employee", () => {
  describe("When I submit a new Bill", () => {
    
    test("Then show the new bill page", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    
    test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      document.body.innerHTML = NewBillUI()

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill") // test if the formNewBill exists
      const billFile = screen.getByTestId('file'); // test if file exists

      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()
      
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e)); 
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled(); // test if the function handleSubmit is called
    })

    test("Then must save the bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
  
      const html = NewBillUI()
      document.body.innerHTML = html
  
      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
  
      const formNewBill = screen.getByTestId("form-new-bill")
      expect(formNewBill).toBeTruthy() // test if the formNewBill exists
      
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled(); // test if the function handleSubmit is called
    });
  })
  // tester la fonction createBill
})
