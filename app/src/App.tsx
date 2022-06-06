import React, { useEffect, useState } from "react";
import Web3 from "web3";
import GreetingsArtifact from "./artifacts/contracts/Greeter.sol/Greeter.json";
import "./App.css";

const web3 = new Web3("ws://localhost:8545");
const Window = window as any;

const contractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const GreetingsContract = new web3.eth.Contract(
  GreetingsArtifact.abi as any,
  contractAddress
);

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [newContractValue, setNewContractValue] = useState("");

  const getBalance = async () => {
    if (account) {
      const balance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(balance, "ether"));
    }
  };

  const onInit = async () => {
    await Window.ethereum.enable();
    const accounts = await Window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);

    Window.ethereum.on(
      "accountsChanged",
      async function (newAccounts: string[]) {
        setAccount(accounts[0]);
      }
    );
  };

  const getDataContract = async () => {
    const res = await GreetingsContract.methods.greet().call();
    setContractValue(res);
  };

  const setDataContract = async () => {
    // const res = await GreetingsContract.methods
    //   .setGreeting(newContractValue)
    //   .send({
    //     from: account,
    //   });
    // console.log(res);

    const tx = {
      from: account,
      to: contractAddress,
      data: GreetingsContract.methods.setGreeting(newContractValue).encodeABI(),
    };
    Window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [tx],
      })
      .then((result: any) => {
        setNewContractValue("");
        getDataContract();
        getBalance();
      })
      .catch((error: any) => {
        console.error("Transaction ERROR:", error);
      });
  };

  useEffect(() => {
    onInit();
    getDataContract();
  }, []);

  useEffect(() => {
    getBalance();
  }, [account, getBalance]);

  return (
    <div className="App">
      <header className="App-header">
        {account ? (
          <>
            <div>Account: {account}</div>
            <div>ETH: {balance}</div>
            <div>Contract data: {contractValue}</div>
            <div>
              <input
                onChange={(e) => setNewContractValue(e.target.value)}
                value={newContractValue}
                placeholder="Enter new data"
              />
              <button onClick={setDataContract}>Send</button>
            </div>
          </>
        ) : (
          <div>Loading...</div>
        )}
      </header>
    </div>
  );
}

export default App;
