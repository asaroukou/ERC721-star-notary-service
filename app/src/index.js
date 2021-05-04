import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      console.log(networkId)
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      console.log(deployedNetwork)

      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;
    try {
      await createStar(name, id).send({from: this.account});
    } catch (error) {
      console.log(error)
    }
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  // Implement Task 4 Modify the front end of the DAPP
  lookUp: async function (){
    const lookid = document.getElementById("lookid").value
    const { lookUptokenIdToStarInfo, ownerOf } = this.meta.methods;
    try {
      const starName = await lookUptokenIdToStarInfo(lookid).call()
      const owner = await ownerOf(lookid).call()
      if(starName.length > 0) {
        App.setStatus(`Start ID ${lookid} has name ${starName} and owned by ${owner}`);
      }else {
        App.setStatus(`No star has the given ${lookid} ID`);
      }
    } catch(error) {
      App.setStatus(`No star has the given ${lookid} ID`);
    }
  }

};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"),);
  }

  App.start();
});