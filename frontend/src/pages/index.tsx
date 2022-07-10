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

  useEffect(() => {
    if (!todoList) return;
    if (!loading) return;
    const getTasks = async () => {
      const taskCount = await todoList.methods.taskCount().call();
      console.log("taskCount", taskCount);
      const promises = [];
      for (let i = 1; i <= parseInt(taskCount); i++) {
        const task = todoList.methods.tasks(i).call();
        // setTasks((prevTasks) => [...prevTasks, task]);
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
          "0x8c4DA3ad53ec09dd3B96A5abF704c9A852B888E0"
        )
      );
    };
    connect();
  }, []);
  return (
    <div className={`max-w-xl mx-auto ${loading ? "animate-pulse" : ""}`}>
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
