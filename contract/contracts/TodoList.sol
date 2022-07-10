// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TodoList {
    uint256 public taskCount = 0;
    struct Task {
        uint256 id;
        string content;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;

    constructor() {
        createTask("Learn smartcontract");
    }

    // function for create task
    function createTask(string memory _content) public {
        taskCount++;

        tasks[taskCount] = Task(taskCount, _content, false);
    }

    function getTask(uint256 _id) public view returns (Task memory) {
        return tasks[_id];
    }

    function completeTask(uint256 _id) public {
        tasks[_id].completed = true;
    }
}
