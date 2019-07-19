var json = {
    "completedHtml": "<h3>Thank you for your feedback.</h3> <h5>Your thoughts and ideas will help us to create a great product!</h5>",
    "completedHtmlOnCondition": [
        {
            "expression": "{nps_score} > 8",
            "html": "<h3>Thank you for your feedback.</h3> <h5>We glad that you love our product. Your ideas and suggestions will help us to make our product even better!</h5>"
        }, {
            "expression": "{nps_score} < 7",
            "html": "<h3>Thank you for your feedback.</h3> <h5> We are glad that you share with us your ideas.We highly value all suggestions from our customers. We do our best to improve the product and reach your expectation.</h5>\n"
        }
    ],
    "pages": [
    {
        "name": "page1",
        "elements": [
            {
                "type": "text",
                "name": "question1",
                "title": "Field of study:"
            },
            {
                "type": "text",
                "name": "question2",
                "title": "Number of semester:"
            },
            {
                "type": "radiogroup",
                "name": "question3",
                "title": "Age:",
                "choices": [
                    {
                        "value": "item1",
                        "text": "18-24"
                    },
                    {
                        "value": "item2",
                        "text": "25-30"
                    },
                    {
                        "value": "item3",
                        "text": "More than 30"
                    }
                ]
            },
            {
                "type": "radiogroup",
                "name": "question4",
                "title": "Gender:",
                "choices": [
                    {
                        "value": "item1",
                        "text": "Male"
                    },
                    {
                        "value": "item2",
                        "text": "Female"
                    },
                    {
                        "value": "item3",
                        "text": "Do not wish to answer"
                    }
                ]
            },
            {
                "type": "matrix",
                "name": "question5",
                "title": "How familiar are you with the following concepts? \t",
                "columns": [
                    {
                        "value": "Column 1",
                        "text": "1 ( Unfamiliar )"
                    },
                    {
                        "value": "Column 2",
                        "text": "2"
                    },
                    {
                        "value": "Column 3",
                        "text": "3"
                    },
                    {
                        "value": "Column 4",
                        "text": "4"
                    },
                    {
                        "value": "Column 5",
                        "text": "5"
                    },
                    {
                        "value": "Column 6",
                        "text": "6"
                    },
                    {
                        "value": "Column 7",
                        "text": "7 ( Very Familiar )"
                    }
                ],
                "rows": [
                    {
                        "value": "Row 1",
                        "text": "Correlation Analysis"
                    },
                    {
                        "value": "Row 2",
                        "text": "Data Analysis"
                    },
                    {
                        "value": "Row 3",
                        "text": "Data Visualization"
                    }
                ]
            }
        ],
        "title": "1.Basic Information"
    },
    {
        "name": "page2",
        "elements": [
            {
                "type": "text",
                "name": "question6",
                "title": "How many attributes are available in this data set?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page3",
        "elements": [
            {
                "type": "text",
                "name": "question7",
                "title": "How many pairs of attributes are available in this data set?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page4",
        "elements": [
            {
                "type": "text",
                "name": "question8",
                "title": "What is the correlation value between Attribute A2 and Attribute A3 at Timestamp T1, or the probable range?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page5",
        "elements": [
            {
                "type": "text",
                "name": "question9",
                "title": "What is the correlation value between Attribute A5 and Attribute A7 at Timestamp T4001, or the probable range?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page6",
        "elements": [
            {
                "type": "text",
                "name": "question10",
                "title": "What is the correlation value between Attribute A6 and Attribute A8 at Timestamp T1501, or the probable range?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page7",
        "elements": [
            {
                "type": "text",
                "name": "question11",
                "title": "Which pair of attributes has the highest correlation at Timestamp T501?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page8",
        "elements": [
            {
                "type": "text",
                "name": "question12",
                "title": "Which pair of attributes has the highest correlation at Timestamp T3001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page9",
        "elements": [
            {
                "type": "text",
                "name": "question13",
                "title": "Which pair of attributes has the highest correlation at Timestamp T4501?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page10",
        "elements": [
            {
                "type": "text",
                "name": "question14",
                "title": "Which pair of attributes has the lowest correlation at Timestamp T2251?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page11",
        "elements": [
            {
                "type": "text",
                "name": "question15",
                "title": "Which pair of attributes has the lowest correlation at Timestamp T1701?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page12",
        "elements": [
            {
                "type": "text",
                "name": "question16",
                "title": "Which pair of attributes has the lowest correlation at Timestamp T3301?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page13",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question17",
                "title": "The following statement is true or false: \"The correlation value between Attribute A1 and Attribute A8 remains the same at Timestamp T501 and Timestamp T1501\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page14",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question18",
                "title": "The following statement is true or false: \"The difference of correlation value between Attribute A1 and Attribute A9 at Timestamp T2001 and Timestamp T3501 changes over 0.5\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page15",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question19",
                "title": "The following statement is true or false: \"The difference of correlation value between Attribute A1 and Attribute A3 at Timestamp T2501 and Timestamp T3001 is over 0.5\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page16",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question20",
                "title": "The following statement is true or false: \"The correlation value between Attribute A1 and Attribute A7 at Timestamp T2501 and Timestamp T3001 remains the same\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page17",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question21",
                "title": "The following statement is true or false: \"The correlation value between Attribute A3 and Attribute A8 at Timestamp T1501 and Timestamp T9501 remains the same\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page18",
        "elements": [
            {
                "type": "radiogroup",
                "name": "question22",
                "title": "The following statement is true or false: \"The difference of correlation value between Attribute A5 and Attribute A6 at Timestamp T2751 and Timestamp T2801 is smaller than 0.2\"?",
                "choices": [
                    {
                        "value": "item1",
                        "text": "True"
                    },
                    {
                        "value": "item2",
                        "text": "False"
                    }
                ]
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page19",
        "elements": [
            {
                "type": "text",
                "name": "question23",
                "title": "Which pair(s) of attributes has a correlation value that is bigger than 0.7 at Timestamp T3001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page20",
        "elements": [
            {
                "type": "text",
                "name": "question24",
                "title": "Which pair(s) of attributes has a correlation value that is bigger than 0.5 at Timestamp T1001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page21",
        "elements": [
            {
                "type": "text",
                "name": "question25",
                "title": "Which pair(s) of attributes has a correlation value that is bigger than 0.8 at Timestamp T8001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page22",
        "elements": [
            {
                "type": "text",
                "name": "question26",
                "title": "Which pair(s) of attributes has a correlation value that is smaller than 0.006 at Timestamp T1001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page23",
        "elements": [
            {
                "type": "text",
                "name": "question27",
                "title": "Which pair(s) of attributes has a correlation value that is smaller than 0.002 at Timestamp T9001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page24",
        "elements": [
            {
                "type": "text",
                "name": "question28",
                "title": "Which pair(s) of attributes has a correlation value that is smaller than 0.002 at Timestamp T5001?"
            }
        ],
        "title": "Visualization"
    },
    {
        "name": "page25",
        "elements": [
            {
                "type": "text",
                "name": "question29",
                "title": "Please write down the visualization method you have used "
            },
            {
                "type": "rating",
                "name": "question30",
                "title": "Is this visualization method intuitive?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question31",
                "title": "Is this visualization method convenient?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question32",
                "title": "Is this visualization method interactive?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question33",
                "title": "Is this visualization method useful?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question34",
                "title": "Is this visualization method complicated?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question35",
                "title": "Is this visualization method efficient?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "rating",
                "name": "question36",
                "title": "Is this visualization method effective?",
                "rateValues": [
                    {
                        "value": 1,
                        "text": "1 ( Strongly disagree )"
                    },
                    2,
                    3,
                    4,
                    5,
                    6,
                    {
                        "value": 7,
                        "text": "7 ( Strongly agree )"
                    }
                ],
                "rateMax": 7
            },
            {
                "type": "text",
                "name": "question37",
                "title": "In your opinion, what are the strengths of this visualization system?"
            },
            {
                "type": "text",
                "name": "question38",
                "title": "In your opinion, what are the weaknesses of this visualization system?"
            },
            {
                "type": "text",
                "name": "question39",
                "title": "Do you have any suggestions for improving this visualization system?"
            }
        ],
        "title": "3.Feedback"
    }
],
    "showQuestionNumbers": "off"
};

window.survey = new Survey.Model(json);

survey
    .onComplete
    .add(function (result) {
        document
            .querySelector('#surveyResult')
            .textContent = "result: " + JSON.stringify(result.data);
    });

$("#surveyElement").Survey({model: survey});
