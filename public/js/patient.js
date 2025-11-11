class Patient {
  constructor(id, firstName, lastName) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
  }

    getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  
  getSummary() {
    return {
      id: this.id,
      name: this.getFullName(),
    };
  }
}