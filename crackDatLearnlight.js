/*------------ to do ------------/*
    wait for document without timeout, document.ready property?
    polls erkennen mit class = card__instructions-text ?
    Aufgaben, die nicht gelöst werden können: 
        Group the options --> more testing needed
        dropdown select -> dropdown expand mit jquery möglich aber nicht der select
        wenn wörter als checkboxes mehrfach auftachen, wird immer das erste element gewählt

/*-------------------------------*/

var timeout = 300 //reduce to increase speed, too low values can cause the browser to crash

var amountOfCards = parseInt(
  Array.from(
    document.getElementsByClassName('activity__header-content__cardCount')
  )[0].innerHTML.match(/[\d]+$/)[0]
)
var currentCard = parseInt(
  Array.from(
    document.getElementsByClassName('activity__header-content__cardCount')
  )[0].innerHTML.match(/\d+/)[0]
)

//remove that stupid background-image
var bgObject = document.getElementById('PageContent')
bgObject.style.backgroundImage = bgObject.style.backgroundImage.replace(
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/,
  ''
)

//main part
if (localStorage.length == 0) {
  //localstorage empty, start learning phase
  /* ----------------------------------------------------------- first part; learning phase ----------------------------------------------------------------------------------------------*/
  //clear the storage
  localStorage.clear()

  while (currentCard <= amountOfCards) {
    currentCard = parseInt(
      Array.from(
        document.getElementsByClassName('activity__header-content__cardCount')
      )[0].innerHTML.match(/\d+/)[0]
    )
    if (document.getElementById('viewCorrectAnswer')) {
      //if already in correcting state
      document.querySelector('#viewCorrectAnswer').click() //view correct answer

      //get question or description
      var question
      try {
        question = document.getElementsByClassName('card__header-text')[0]
          .innerText //get question statement
      } catch (e) {
        if (e instanceof TypeError) {
          if (
            Array.from(
              document.querySelectorAll(
                "[class*='card'][class$='nstructions-text']"
              )
            ).length > 0
          ) {
            question = Array.from(
              document.querySelectorAll(
                "[class*='card'][class$='nstructions-text']"
              )
            )[0].innerText //if it has no description, search for instruction-field; careful the 'i' in 'instructions' can be uppercase
          } else {
            question = null
          }
        }
      }
      localStorage.setItem(`question_card${currentCard}`, question) //writing it to storage

      //determine what type of question we have
      var classList
      try {
        classList = Array.from(
          document.querySelectorAll('[class*="answers__container"]')[0]
            .classList
        )
      } catch (e) {
        if (e instanceof TypeError) {
          //another different type of clickable boxes
          classList = Array.from(
            document.querySelectorAll('[class*="Card__fixedAnswers"]')[0]
              .classList
          )
        }
      }
      if (
        classList.includes('draganddropCard__fixedAnswers') ||
        classList.includes('orderingCard') ||
        classList.includes('orderingCard__fixedAnswers') ||
        classList.includes('answers__container') ||
        classList.includes('matchingCard__fixedAnswers__container')
      ) {
        var answers = Array.from(
          document.querySelectorAll('[id^="answerDestination"]')
        ) //in case of dragndrop
      } else if (classList.includes('typedtextCard__text')) {
        //typed text
        var answers = Array.from(
          document.querySelectorAll('[class*="typedtextCard__input"]')
        )
      } else if (classList.includes('answers__container--fixed')) {
        //radio or multiple checkboxes
        if (
          Array.from(document.getElementsByClassName('answerBox--identify'))
            .length > 0
        ) {
          //in case of multiple checkboxes ("find the mistakes task")
          var answers = Array.from(
            document.getElementsByClassName('answerBox--identify__input')
          )
        } else {
          var answers = Array.from(
            document.getElementsByClassName('answerBox__input')
          ) //in case of radio
        }
      }

      localStorage.setItem(`amount_card${currentCard}`, answers.length) //writing the length to localstorage
      answers.forEach((element, i) => {
        localStorage.setItem(`type_card${currentCard}_#${i}`, element.type) //writing it to storage
        switch (element.type) {
          case 'typecheckbox':
          case 'checkbox':
          case 'radio':
            var text = Array.from(
              document.getElementsByClassName('answerBox__text')
            )[i].innerHTML
            localStorage.setItem(
              `value_card${currentCard}_#${i}`,
              element.checked + ',' + text
            ) //writing it to storage and append text since its randomized
            break
          case 'select-one':
            localStorage.setItem(
              `value_card${currentCard}_#${i}`,
              element[parseInt(element.selectedIndex)].innerHTML
            ) //writing it to storage, first, get the index of the correct option then select the proper child
            break
          case 'text':
            localStorage.setItem(
              `value_card${currentCard}_#${i}`,
              element.value
            ) //writing it to storage
            break
          case undefined: //sequence has to be correct on left and right hand side
            if (element.firstChild.firstChild.innerText != undefined) {
              localStorage.setItem(
                `value_card${currentCard}_#${i}`,
                element.firstChild.firstChild.innerText
              ) //writing it to storage
            } else {
              //probably falsely tracked text-type, skipping
              localStorage.setItem(
                `amount_card${currentCard}`,
                parseInt(localStorage.getItem(`amount_card${currentCard}`) - 1)
              ) //decrease length by 1
            }
            break
          case '': //a-link
            localStorage.setItem(
              `value_card${currentCard}_#${i}`,
              element.firstChild.innerText
            ) //writing it to storage
            break
          default:
            console.warn(`non recognizable type: ${element.type}`)
            break
        }
      })
      document.getElementsByClassName('continue')[0].click() //go to next card
    } else if (document.getElementById('skipCard')) {
      document.querySelector('#skipCard').click() //skip is availiable as in recording cards
      await new Promise(r => setTimeout(r, timeout))
    } else if (
      Array.from(document.getElementsByClassName('continue')).length > 0
    ) {
      //no solution available, probably vote task
      localStorage.setItem(`type_card${currentCard}`, 'poll')
      document.getElementsByClassName('continue')[0].click() //skipping
      await new Promise(r => setTimeout(r, timeout))
    } else {
      Array.from(
        document.querySelectorAll('[class*="cardProgress__btn--check"]')
      )[0].click() //continue or check for solution
      await new Promise(r => setTimeout(r, timeout))
    }
    if (document.getElementById('toast-container')) {
      //last element has been fired and entered checking phase
      break
    }
  }
} else {
  /* ----------------------------------------------------------- second part; solving phase ----------------------------------------------------------------------------------------------*/
  while (currentCard <= amountOfCards) {
    currentCard = parseInt(
      Array.from(
        document.getElementsByClassName('activity__header-content__cardCount')
      )[0].innerHTML.match(/\d+/)[0]
    )
    if (document.getElementById('toast-container')) {
      //last element has been fired and entered checking phase
      break
    }
    if (document.getElementById('skipCard')) {
      document.querySelector('#skipCard').click() //skip is availiable as in recording cards
    } else if (document.getElementById('contentContinue')) {
      document.getElementById('contentContinue').click()
    } else if (
      Array.from(document.getElementsByClassName('continue')).length > 0
    ) {
      //no solution available, probably vote task
      document.getElementsByClassName('continue')[0].click() //skipping
    } else {
      //get question or description
      var question
      try {
        question = document.getElementsByClassName('card__header-text')[0]
          .innerText //get question statement
      } catch (e) {
        if (e instanceof TypeError) {
          if (
            Array.from(
              document.querySelectorAll(
                "[class*='card'][class$='nstructions-text']"
              )
            ).length > 0
          ) {
            question = Array.from(
              document.querySelectorAll(
                "[class*='card'][class$='nstructions-text']"
              )
            )[0].innerText //if it has no description, search for instruction-field; careful the 'i' in 'instructions' can be uppercase
          } else {
            question = 'null'
          }
        }
      }
      if (question == localStorage.getItem(`question_card${currentCard}`)) {
        //verify the question is the same as in the storage
        var amountAnswer = parseInt(
          localStorage.getItem(`amount_card${currentCard}`)
        )
        var isSolvable = false
        console.clear() //clean up console
        for (var i = 0; i < amountAnswer; i++) {
          var type = localStorage.getItem(`type_card${currentCard}_#${i}`)
          switch (type) {
            case 'typecheckbox':
            case 'checkbox':
            case 'radio':
              //converting string back to its elements with regex in the format (complete match, group 1, group 2)
              var value = localStorage
                .getItem(`value_card${currentCard}_#${i}`)
                .match(/([^,]+),(.+)/)[1]
              var text = localStorage
                .getItem(`value_card${currentCard}_#${i}`)
                .match(/([^,]+),(.+)/)[2]
              var allTextContents = Array.from(
                document.getElementsByClassName('answerBox__text')
              )
              for (const [j, element] of allTextContents.entries()) {
                if (element.innerHTML == text) {
                  if (value === 'true') {
                    //since it is a string it needs to be converted back to boolean
                    Array.from(
                      document.querySelectorAll(
                        "[class*='answerBox'][class$='input']"
                      )
                    )[j].click()
                    break
                  }
                }
              }
              isSolvable = true
              break
            case 'select-one':
              var value = localStorage.getItem(`value_card${currentCard}_#${i}`)
              console.log(
                `%cyou need to put ` +
                  `%c${value}` +
                  `%c into element ` +
                  `%c${i}`,
                'color:inherit',
                'color:chartreuse',
                'color:inherit',
                'color:chartreuse'
              )
              isSolvable = false
              break
            case 'text':
              var answers = Array.from(
                document.querySelectorAll('[class*="typedtextCard__input"]')
              )
              var value = localStorage.getItem(`value_card${currentCard}_#${i}`)
              answers[i].value = value
              isSolvable = true
              break
            case 'undefined': //sequence has to be correct on left and right side
            case '': //a-link
              var value = localStorage.getItem(`value_card${currentCard}_#${i}`)
              var link = Array.from(
                document.querySelectorAll('[id^="answerDestination"]')
              )[i]
              if (value.includes('\n')) {
                //could be vertical grouping, so the two parts must be separated
                var answer = value.match(/(.+)\n+(.+)/) //separating left and right answer fragment by newline character
                var leftFragment = Array.from(
                  document.querySelectorAll(
                    "[class^='matchingCard__fixedAnswer__span'], [class='orderingCard__fixedAnswer__content']"
                  )
                )
                for (const [j, element] of leftFragment.entries()) {
                  if (
                    element.innerText.replaceAll(/(\n|\s)+$/g, '') == answer[1]
                  ) {
                    //now we have the correct left side, search for the other side
                    element.click() //selecting the left fragment
                    value = answer[2].replace(/\t$/, '') //remove all appending tabs //assign new content to value
                    break
                  }
                }
              } else {
                link.click() //select each element
              }
              var availableBoxes = Array.from(
                document.getElementsByClassName('js-movable')
              ) //unfify both card types
              for (const [j, element] of availableBoxes.entries()) {
                if (element.firstChild.innerText == value) {
                  element.click()
                  break
                }
              }
              isSolvable = true
              break
            default:
              console.warn('non recognizable type')
              isSolvable = false
              break
          }
        }
        if (isSolvable) {
          document.getElementsByClassName('cardProgress__btn--check')[0].click() //check the answers
        } else {
          //for all non solvable types wait for user input
          console.log(
            "You need to act: Solve the card and click on 'Check' button"
          )
          new Audio(
            'https://dkihjuum4jcjr.cloudfront.net/ES_ITUNES/Multimedia%20787/ES_Multimedia%20787.mp3'
          ).play() //play notification sound
          async function btnClick (btn) {
            return new Promise(resolve => (btn.onclick = resolve))
          }
          await btnClick(document.getElementById('checkCard'))
        }
        await new Promise(r => setTimeout(r, timeout))
        document.getElementsByClassName('continue')[0].click() //go to next card
      } else if (localStorage.getItem(`type_card${currentCard}`)) {
        //type = poll
        document.getElementsByClassName('cardProgress__btn--check')[0].click()
        document.getElementsByClassName('continue')[0].click() //skipping
      } else {
        console.error(
          'Whoops something went wrong while reading the data because the question is not in the localstorage'
        )
        break
      }
    }
  }

  //fininshed, clean up the storage
  localStorage.clear()
}

/*------------ deprecated --------------/*
function openDropdown(elementId) {
    function down() {
        var pos = $(this).offset() // remember position
        var len = $(this).find("option").length
            if(len > 20) {
                len = 20
            }

        $(this).css("position", "absolute")
        $(this).css("zIndex", 9999)
        $(this).offset(pos)   // reset position
        $(this).attr("size", len) // open dropdown
        $(this).unbind("focus", down)
        $(this).focus()
    }
    function up() {
        $(this).css("position", "static")
        $(this).attr("size", "1")  // close dropdown
        $(this).unbind("change", up)
        $(this).focus()
    }
    $("#" + elementId).focus(down).blur(up).focus()
}
/*---------------------------------*/
