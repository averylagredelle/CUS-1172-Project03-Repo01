const appState = {
    current_view: "#intro_view",
    current_question: 0,
    current_quiz: "",
    current_quiz_repo: "",
    current_model: {}
};

const encouragingMessage = [
    `<div class="container"><img class="center" width="300px" height="300px" src="https://thumbs.dreamstime.com/b/hand-drawn-lettering-word-brilliant-motivational-quote-hand-drawn-lettering-word-brilliant-167630836.jpg"></div>`,
    `<div class="container"><img class="center" width="300px" height="300px" src="https://thumbs.dreamstime.com/b/word-amazing-comic-cloud-explosion-background-illustration-216308972.jpg"></div>`,
    `<div class="container"><img class="center" width="300px" height="300px" src="https://media.istockphoto.com/id/1280293279/vector/great-job-word-isolated-with-stars-hand-calligraphy-lettering-as-logo-icon-tag-label.jpg?s=612x612&w=0&k=20&c=YceXShflBjne1q5bYA9b6wi-_CqXhq9TOv1JwddlFWI="></div>`
];

var choiceSelected = "";
var userName = "";
var score = 0;
var timer;

document.addEventListener("DOMContentLoaded", () => {
    appState.current_view = "#intro_view";
    update_view();

    document.querySelector("#widget_view").onclick = (e) => {
        handle_widget_event(e);
        return false;
    }
})

function update_view() {
    let template_source = document.querySelector(appState.current_view).innerHTML;
    var template = Handlebars.compile(template_source);
    var html_widget_element = template({...appState.current_model, ...appState});
    document.querySelector("#widget_view").innerHTML = html_widget_element;
}

function handle_widget_event(e) {
    switch(e.target.id) {
        case "java_quiz": {
            if(document.querySelector("#user_name").value == "") {
                alert("Please enter your name before selecting a quiz.");
            }
            else {
                userName = document.querySelector("#user_name").value;
                appState.current_quiz = "java_quiz";
                appState.current_quiz_repo = "CUS-1172";
                get_next_question();
            }
            break;
        }

        case "javascript_quiz": {
            if(document.querySelector("#user_name").value == "") {
                alert("Please enter your name before selecting a quiz.");
            }
            else {
                userName = document.querySelector("#user_name").value;
                appState.current_quiz = "javascript_quiz";
                appState.current_quiz_repo = "Project-3";
                get_next_question();
            }
            break;
        }

        case "choice_1":
        case "choice_2":
        case "choice_3":
        case "choice_4": {
            select_choice(`#${e.target.id}`);
            break;
        }

        case "got_it": {
            get_next_question();
        }
    }

    switch(e.target.dataset.action) {
        case "answer": {
            check_answer(e.target.dataset.answer);
            break;
        }
        case "submit": {
            switch(appState.current_view) {
                case "#multiple_choice": {
                    if(choiceSelected != "") {
                        check_answer(choiceSelected);
                    }
                    else {
                        alert("Please choose an option before submitting.");
                    }
                    break;
                }
    
                case "#text_input_one": {
                    let answer = document.querySelector(`#${appState.current_model.answerFieldId}`).value;
                    if(answer != "") {
                        check_answer(answer);
                    }
                    else {
                        alert("Please enter an answer before submitting.");
                    }
                    break;
                }
    
                case "#text_input_multiple": {
                    let answerOne = document.querySelector(`#${appState.current_model.answerFieldOneId}`).value;
                    let answerTwo = document.querySelector(`#${appState.current_model.answerFieldTwoId}`).value;
                    
                    if(answerOne == "" || answerTwo == "") {
                        alert("Please fill in both fields before submitting.");
                    }
                    else if(answerOne == answerTwo) {
                        alert("Please submit two different answers in the text boxes.");
                    }
                    else {
                        check_answers(answerOne, answerTwo);
                    }
                }
    
            }
            break;
        }
        case "return_home": {
            reset_view();
            break;
        }
        case "retake_quiz": {
            reset_quiz();
            break;
        }
    }
}

async function get_next_question() {
    appState.current_question += 1;
    try{
        let question = await fetch(`https://my-json-server.typicode.com/averylagredelle/${appState.current_quiz_repo}/${appState.current_quiz}?id=${appState.current_quiz}_question${appState.current_question}`);
        let questionObj = await question.json();
        appState.current_model = questionObj[0];
        appState.current_view = "#" + appState.current_model.questionType;
        update_view();
        if(appState.current_question == 1) {
            show_scoreboard();
        }
        else {
            update_scoreboard();
        }
    } 
    catch(err) {
        if(((score/(appState.current_question - 1)) * 100) >= 80) {
            show_end_screen(true);
        }
        else {
            show_end_screen(false);
        }
        update_scoreboard();
    }
}

function show_scoreboard() {
    let template = Handlebars.compile(document.querySelector("#scoreboard_view").innerHTML);
    let html_widget_element = template();
    document.querySelector("#scoreboard").innerHTML = html_widget_element;

    let time_elapsed = document.querySelector("#time_elapsed");

    var start = Date.now();

    timer = setInterval(function() {
        var delta = Date.now() - start;
        let hours = 0;
        let hoursTime = "0";
        let minutes = 0;
        let minutesTime = "00";
        let seconds = 0;
        let secondsTime = "00";
        if(delta >= 3600000) {
            hours = Math.floor(delta/3600000);
        }
        if(delta >= 60000) {
            minutes = Math.floor(delta/60000);
        }
        if(delta >= 1000) {
            seconds = Math.floor(delta/1000);
        }
        seconds = seconds - (minutes * 60);
        minutes = minutes - (hours * 60);
        if(seconds < 10) {
            secondsTime = `0${seconds}`;
        }
        else {
            secondsTime = `${seconds}`;
        }
        if(minutes < 10) {
            minutesTime = `0${minutes}`;
        }
        else {
            minutesTime = `${minutes}`;
        }
        hoursTime = `${hours}`;
        time_elapsed.innerHTML = `${hoursTime}:${minutesTime}:${secondsTime}`;
    }, 100);

}

function update_scoreboard() {
    let scoreCount = document.querySelector("#score");
    let questionsAnswered = document.querySelector("#questions_answered");

    scoreCount.innerHTML = Math.floor((score/(appState.current_question - 1)) * 100);
    questionsAnswered.innerHTML = appState.current_question - 1;
}

function hide_scoreboard() {
    document.querySelector("#scoreboard").innerHTML = "";
}

function check_answer(answer) {
    if(answer == appState.current_model.correctAnswer) {
        score += 1;
        show_correct_view();
        setTimeout(get_next_question, 1000);
    }
    else {
        show_incorrect_view();
    }
    choiceSelected = "";
}

function check_answers(answerOne, answerTwo) {
    let answerOneCorrect = false;
    let answerTwoCorrect = false;
    let correctAnswers = appState.current_model.correctAnswer;

    for(let i = 0; i < correctAnswers.length; i++) {
        if(correctAnswers[i] == answerOne) {
            answerOneCorrect = true;
        }
        if(correctAnswers[i] == answerTwo) {
            answerTwoCorrect = true;
        }
    }

    if(answerOneCorrect && answerTwoCorrect) {
        score += 1;
        show_correct_view();
        setTimeout(get_next_question, 1000);
    }
    else {
        show_incorrect_view();
    }
}

function show_correct_view() {
    document.querySelector("#widget_view").innerHTML = encouragingMessage[Math.floor(Math.random() * encouragingMessage.length)];
}

function show_incorrect_view() {
    let template = Handlebars.compile(document.querySelector("#feedback_view").innerHTML);
    let html_widget_element = template(appState.current_model);
    document.querySelector("#widget_view").innerHTML = html_widget_element;

    let right_answer = document.querySelector("#right_answer");
    right_answer.innerHTML = ``;
    switch(appState.current_model.questionType) {
        case "text_input_multiple": {
            if(appState.current_model.correctAnswer.length == 2) {
                right_answer.innerHTML = `${appState.current_model.correctAnswer[0]} and ${appState.current_model.correctAnswer[1]}`;
            }
            else if(appState.current_model.correctAnswer.length > 2) {
                for(let i = 0; i <= appState.current_model.correctAnswer.length - 2; i++) {
                    right_answer.innerHTML += `${appState.current_model.correctAnswer[i]}, `;
                }
                right_answer.innerHTML += `or ${appState.current_model.correctAnswer[appState.current_model.correctAnswer.length - 1]}`;
            }
            break;
        }

        case "image_selection": {
            if(appState.current_model.options[0].id == appState.current_model.correctAnswer) {
                right_answer.innerHTML = "the first image";
            }
            else {
                right_answer.innerHTML = "the second image";
            }
            break;
        }

        default: {
            right_answer.innerHTML = appState.current_model.correctAnswer;
        }
    }
}

function select_choice(choice_id) {
    choice = document.querySelector(choice_id);
    choiceSelected = choice.value;
    let new_html = `<input name="${choice.name}" type="radio" value='${choice.value}' id="${choice.id}" checked>`;
    choice.outerHTML = new_html;
}

function show_end_screen(passed) {
    var endMessage;
    if(passed) {
        endMessage = `Congrats, ${userName}! You passed the quiz!`
    }
    else {
        endMessage = `Sorry, ${userName}. You failed the quiz.`
    }
    let template = Handlebars.compile(document.querySelector("#end_view").innerHTML);
    let html_widget_element = template({message: endMessage});
    document.querySelector("#widget_view").innerHTML = html_widget_element;

    clearInterval(timer);
}

function reset_view() {
    appState.current_model = {};
    appState.current_question = 0;
    appState.current_view = "#intro_view";
    score = 0;
    hide_scoreboard();
    update_view();
}

function reset_quiz() {
    appState.current_question = 0;
    score = 0;
    hide_scoreboard();
    get_next_question();
}