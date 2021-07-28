const db = require('./db.js')
const inquirer = require('inquirer')

module.exports.add = async (title) => {
    // 读取之前的文件
    const list = await db.read()
    // 往里面添加一个title 任务
    list.push({title, done: false})
    // 存储任务到文件
    await db.write(list)
}

module.exports.clear = async () => {
    await db.write([])
}

function printTasks(list){
    inquirer
        .prompt(
            {
                type: 'list',
                name: 'index',
                message: '请选择你想操作的任务',
                choices: [
                    {name:'退出', value: -1},
                    ...list.map((task, index) => {
                        return {name:`${task.done ? '[√]' : '[_]'} ${index+1} - ${task.title}`, value: index}
                    }),
                    {name:'+ 创建任务', value: -2}
                ]
            })
        .then(answer => {
            const index = parseInt(answer.index)
            if(index >= 0) {
                // 选中一个任务
                askForAction(list, index)
            }else if(index === -2) {
                // 创建一个任务
                askForCreateTask(list)
            }
        })
}
function marked(list, index){
    list[index].done = true;
    db.write(list)
}
function unmarked(list, index){
    list[index].done = false;
    db.write(list)
}
function changeTitle(list, index){
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: '新的标题',
        default: list[index].title
    }).then(answer => {
        list[index].title = answer.title
        db.write(list)
    })
}
function remove(list, index){
    list.splice(index, 1)
    db.write(list)
}
function askForAction(list, index){
    const actions = {marked, unmarked, changeTitle, remove}
    inquirer.prompt({
        type: 'list',
        name:'action',
        message:'请选择操作',
        choices:[
            {name: '退出', value: 'quit'},
            {name: '已完成', value: 'marked'},
            {name: '未完成', value: 'unmarked'},
            {name: '更改标题', value:'changeTitle'},
            {name: '删除', value: 'remove'},
        ]
    }).then(answer2 => {
        const action = actions[answer2.action]
        action && action(list, index)
    })
}
function askForCreateTask(list){
    inquirer.prompt({
        type: 'input',
        name: 'title',
        message: '输入任务标题',
    }).then(answer => {
        list.push({
            title: answer.title,
            done: false
        })
        db.write(list)
    })
}

module.exports.showAll = async () => {
    // 读取之前的任务
    const list = await db.read()
    // 打印之前的任务
    printTasks(list)

}
