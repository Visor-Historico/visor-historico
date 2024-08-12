import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="demo"
export default class extends Controller {
  connect() {
    this.element.textContent = "it works alright!"
  }
}
