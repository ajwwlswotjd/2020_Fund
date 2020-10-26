window.log = console.log;


class App {
    constructor(){

        this.datas;


        this.init();
    }

    readData(){
        return $.getJSON("./js/fund.json");
    }

    addEvent(){
        
    }

    render(){
        log(this.datas);
    }

    async init(){
        this.datas = await this.readData();
        this.addEvent();
        this.render();
    }
}

window.addEventListener("load",(e)=>{
    let app = new App();
});


