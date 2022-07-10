// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Learn {
  mapping(address => uint) balances;
  mapping(uint => string) tasks;
  address public owner;
  uint public taskCount;

  constructor() {
    owner = msg.sender;
    
  }

  function createTask(string memory _task) public {    
    tasks[taskCount] = _task;
    taskCount++;
  }

  function getTask(uint _taskId) public view returns (string memory) {
    return tasks[_taskId];
  }





  

}