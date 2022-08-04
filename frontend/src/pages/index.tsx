import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import Web3 from "web3";
import getWeb3 from "../utils/getWeb3";
import TODO_LIST_ABI from "../../../contract/artifacts/contracts/TodoList.sol/TodoList.json";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";

import { TodoList } from "../../../contract/src/types";

const Home = () => {
  const [account, setAccount] = useState<string>();
  const [tasks, setTasks] = useState<any>([]);
  const [todoList, setTodoList] = useState<TodoList>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  async function createTask() {
    if (!todoList) return;
    if (!message) return;

    await todoList.methods.createTask(message).send({ from: account });
    setMessage("");
    setLoading(true);
  }
  async function completedTask(id: number) {
    if (!todoList) return;
    await todoList.methods.completeTask(id).send({ from: account });
    setLoading(true);


  }
  function convertToHex(str: string) {
    var hex = "";
    for (var i = 0; i < str.length; i++) {
      hex += "" + str.charCodeAt(i).toString(16);
    }
    return hex;
  }
  async function sendTx() {
    if (!todoList) return;
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: "0x4d9d313fabe4fc3051c276e8c7e3663ef5a85513",
      // target address, this could be a smart contract address
      to: "0xd9fded60cd81d33f05148a3b11bfcecfa5bdf619",
      // optional if you want to specify the gas limit
      gas: 80000,
      // optional if you are invoking say a payable function
      // value: 0,
      // this encodes the ABI of the method and the arguements
      data: convertToHex("Hello wordk"),
    };
    const web3 = await getWeb3();
    const signPromise = await web3.eth.accounts.signTransaction(
      tx,
      "e2db7f744b597e76fd2dcaa1fe9946f7fa3a8b86248a8c669af477dbc67aef01"
    );
    console.log({ signPromise });
    const sentTx = web3.eth.sendSignedTransaction(
      signPromise.raw || signPromise.rawTransaction
    );
    sentTx.on("receipt", (receipt) => {
      // do something when receipt comes back
      console.log("receipt :>> ", receipt);
    });
    sentTx.on("error", (err) => {
      // do something on transaction error
      console.log("err", err);
    });

  }
  useEffect(() => {
    if (!todoList) return;
    if (!loading) return;
   
    const getTasks = async () => {
      const taskCount = await todoList.methods.taskCount().call();
      console.log("taskCount", taskCount);
      const promises = [];
      for (let i = 1; i <= parseInt(taskCount); i++) {
        const task = todoList.methods.tasks(i).call();
        promises.push(task);
      }
      Promise.all(promises).then((tasks) => {
        setTasks(tasks);
        console.log(tasks);
        setLoading(false);
      });
    };
    getTasks();
  }, [todoList, loading]);
  useEffect(() => {
    const connect = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();

      // let subscription = web3.eth.subscribe("logs", {}, (err, event) => {
      //   if (!err) console.log(event);
      // });

      // subscription.on("data", (event) => console.log(event));
      // subscription.on("changed", (changed) => console.log(changed));
      // subscription.on("error", (err) =>
      //   console.log("error", err.message, err.stack)
      // );
      // subscription.on("connected", (nr) => console.log(nr));
      if (accounts.length > 0) {
        const account = accounts[0];
        console.log(account);
        setAccount(account);
      } else {
        console.log("Account not found");
      }
      setTodoList(
        new web3.eth.Contract(
          TODO_LIST_ABI.abi as AbiItem[],
          "0xcF5b213B9AefF188690804Bd6F099EFCA2900D83"
        )
      );
    };
    connect();
  }, []);
  return (
    <div className={`max-w-xl mx-auto ${loading ? "animate-pulse" : ""}`}>
      <button className="btn" onClick={sendTx}>
        Send TX
      </button>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-center">Todo</h1>
        <h2 className="text-center text-md ">{account}</h2>
      </div>
      <div className="w-full flex justify-between space-x-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type="text"
          placeholder="Type here"
          className="input input-bordered focus:outline-none w-full  flex-grow"
        />
        <button onClick={createTask} className="btn btn-md ">
          Create
        </button>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {tasks?.map((task: any, i: number) => (
          <div key={i} className="form-control border-b-2">
            <label className="cursor-pointer label">
              <span
                className={`label-text text-lg ${
                  task?.completed ? "line-through" : ""
                }`}
              >
                {task.content}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  onChange={() => {
                    completedTask(task.id);
                  }}
                  defaultChecked={task?.completed}
                  type="checkbox"
                  className="checkbox checkbox-secondary"
                  disabled={task?.completed}
                />

                {/* <button className="">remove</button> */}
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
