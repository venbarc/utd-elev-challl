export default class Elevator {
  constructor() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.requests = []
    this.riders = []
  }

  dispatch() {
    if (!this.requests.length && !this.riders.length) {
      return
    }

    this.hasStop()

    let direction = this.getInitialDirection()
    if (!direction) {
      if (this.checkReturnToLoby()) {
        this.returnToLoby()
      }
      return
    }

    while (this.requests.length || this.riders.length) {
      if (direction === 'up') {
        if (this.hasPendingAbove()) {
          this.moveUp()
        } else if (this.hasPendingBelow()) {
          direction = 'down'
        } else {
          break
        }
      } else {
        if (this.hasPendingBelow()) {
          this.moveDown()
        } else if (this.hasPendingAbove()) {
          direction = 'up'
        } else {
          break
        }
      }
    }

    if (this.checkReturnToLoby()) {
      this.returnToLoby()
    }
  }

  goToFloor(person) {
    if (person && !this.requests.includes(person) && !this.riders.includes(person)) {
      this.requests.push(person)
    }
    this.dispatch()
  }

  getInitialDirection() {
    if (this.riders.length) {
      return this.riders[0].dropOffFloor >= this.currentFloor ? 'up' : 'down'
    }
    if (this.requests.length) {
      return this.requests[0].currentFloor >= this.currentFloor ? 'up' : 'down'
    }
    return null
  }

  hasPendingAbove() {
    return this.requests.some(request => request.currentFloor > this.currentFloor) ||
      this.riders.some(rider => rider.dropOffFloor > this.currentFloor)
  }

  hasPendingBelow() {
    return this.requests.some(request => request.currentFloor < this.currentFloor) ||
      this.riders.some(rider => rider.dropOffFloor < this.currentFloor)
  }

  moveUp() {
    this.currentFloor++
    this.floorsTraversed++
    if (this.hasStop()) {
      this.stops++
    }
  }

  moveDown() {
    if (this.currentFloor > 0) {
      this.currentFloor--
      this.floorsTraversed++
      if (this.hasStop()) {
        this.stops++
      }
    }
  }

  hasStop() {
    const didPickup = this.hasPickup()
    const didDropoff = this.hasDropoff()
    return didPickup || didDropoff
  }

  hasPickup() {
    const pickups = this.requests.filter(request => request.currentFloor === this.currentFloor)
    if (!pickups.length) {
      return false
    }

    this.riders.push(...pickups)
    this.requests = this.requests.filter(request => request.currentFloor !== this.currentFloor)
    return true
  }

  hasDropoff() {
    const startingCount = this.riders.length
    this.riders = this.riders.filter(rider => rider.dropOffFloor !== this.currentFloor)
    return this.riders.length !== startingCount
  }

  checkReturnToLoby() {
    return !this.riders.length && !this.requests.length && new Date().getHours() < 12
  }

  returnToLoby() {
    while (this.currentFloor > 0) {
      this.moveDown()
    }
  }

  reset() {
    this.currentFloor = 0
    this.stops = 0
    this.floorsTraversed = 0
    this.riders = []
    this.requests = []
  }
}
