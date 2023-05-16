# Todo app web3

## Cài đặt môi trường

node 14.19.2
```bash
$ node -v
v14.19.2
```

ganache desktop
<https://trufflesuite.com/ganache/>

## Hardhat
### Biên dịch contract
```bash
yarn compile
```

### Deploy contract local
```bash
yarn deploy:local
```

### Tạo typechain cho web3
```bash
yarn compile:web3
```

Đây là một smart contract đơn giản viết trên nền tảng Ethereum bằng ngôn ngữ Solidity. Smart contract này định nghĩa một ứng dụng Todo List đơn giản, cho phép người dùng tạo mới một task, xem nội dung của task, và đánh dấu task đã hoàn thành.

Các thành phần chính của smart contract:

`pragma solidity ^0.8.0;`: Khai báo phiên bản Solidity cần thiết để biên dịch smart contract.
contract TodoList { ... }: Định nghĩa smart contract với tên là TodoList.
uint256 public taskCount = 0;: Biến public taskCount lưu trữ số lượng task hiện tại.
struct Task { ... }: Định nghĩa struct Task gồm các thông tin về task bao gồm id, nội dung và trạng thái hoàn thành.
mapping(uint256 => Task) public tasks;: Mapping public tasks lưu trữ các task theo id.
event TaskAdded(uint256 id, string content);: Sự kiện public TaskAdded được kích hoạt khi một task mới được tạo.
constructor() { ... }: Hàm khởi tạo của smart contract, được gọi khi contract được triển khai. Trong đó sẽ tạo một task mới để thử nghiệm.
function createTask(string memory _content) public { ... }: Hàm public createTask cho phép tạo một task mới. Trong đó tạo một task mới, tăng biến taskCount lên 1 và kích hoạt sự kiện TaskAdded.
function getTask(uint256 _id) public view returns (Task memory) { ... }: Hàm public getTask cho phép xem thông tin của một task dựa trên id. Hàm này trả về một biến kiểu Task và chỉ có thể xem, không thể sửa.
function completeTask(uint256 _id) public { ... }: Hàm public completeTask cho phép đánh dấu một task đã hoàn thành. Hàm này sẽ thay đổi trạng thái hoàn thành của task tương ứng trong mapping tasks.
