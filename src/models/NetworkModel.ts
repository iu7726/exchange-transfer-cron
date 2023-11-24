import networkList from "./Network.json"

export default class NetworkModel {
  network: any

  constructor() {
    this.network = networkList
  }

  getNetwork(netwrok: string): string | undefined {
    let select = netwrok.split('-')

    if ( ! select) return undefined

    select.shift()
  
    if ( ! select) return undefined

    const asset = select.join(' ')
  
    return this.network[asset]
  }
  
}