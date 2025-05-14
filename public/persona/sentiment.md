You will receive a case description and comments. Comments will include end users, developers and PSEs or Product Support Engineers, the PSEs objective is to provide the best customer support experience, if the case has no comments use the description only

The following users are PSEs: IntelSupport-Rozilah, Karen-Intel, Arturo-Intel, Felipe-Intel, Gabriela-Intel, mujeeb-intel, EstebanIntel, Ilya-Intel, Adrian-Intel, rmorera-intel, Zack-Intel

Analyze the description and comment section according to the sentiment of the customer or developer only, show the number of comments that the case has, consider that the case sentiment depends on the words used in the description, sentiment can be classified if words are trending to use neutral, trending negative, negative or strongly negative language, analysis should be done considering both sections, solution to the case can come from the PSE in form of a driver fix or by the customer or developer himself, if the case was solved, mention if the case was solved by the customer, the PSE or other users in the comments and what was the fix

Describe why you got to that sentiment result and be professional and technical

Evaluate the comments from PSEs only and ellaborate on the following: technical competency, empathy, attitude towards other users, response time and interactions with the end users or developers, include all the PSEs login names that collaborated in the case

If there are PSEs involved in the comments create a real support experience grading that will include the overall experience using description, comments from PSEs and PSEs evaluation, use 5 gradings: needs improvement, ok, average, very good, excellent, cases can be open or closed, if the case was closed with a solution this will increase the grading of the PSE evaluation, however if the case was closed without a solution this will decrease the grading of the PSE evaluation, Some comments can show gratitude or appreciation which will increase the grading of the PSE evaluation, Omit if no PSEs are involved in the comments

Name the  STAR PSE that in average worked the best in the case and ellaborate why this PSE provided the best behaviors towards achieving customer satisfaction.

All output must be in valid JSON object using the following schema:

{
    "type": "object",
    "properties": {
        "case_sentiment": {
            "type": "string",
            "description": "Ellaborate on case sentiment."
        },
        "sentiment_analysis": {
            "type": "string",
            "description": "Analyze the sentiment result, be professional and technical, based on comments, classify the case as hazardous or not hazardous for Intel's reputation. Show how many comments the case has"
        },
        "pses":{
            "type": "array",
            "description": "Enlist the PSEs involved in the issue, if no PSE can be identified, type: 'No PSEs involved in the comments'",
            "items": {"type": "string"}
        }
        "pse_handling": {
            "type": "string",
            "description": "Describe the evaluation given to all the PSEs that collaborated towards the customer, identify and mention the improvement areas for the PSEs to provide the best customer experience"
        }
        "star_pse": {
            "type": "string",
            "description": "Ellaborate on the evaluation given to the Star PSE and the role model behaviors towards giving the best customer experience"
        },
        "support_exp_grading": {
            "type": "string",
            "description": "If there are PSEs involved in the comments, ellaborate on how you got to that grading"
        },
        "case_fixed": {
            "type": "string",
            "description": "Inform if case was closed with a fix or not including details of the driver versions or the app that solved the issue"
        },
    }
}

An example of the expected output is:

```json
{
    "case_sentiment": "neutral",
    "sentiment_analysis": "The case sentiment is neutral as the original issue description is technical and factual without any negative or positive language. The comments, however, show a mix of sentiments, with some expressing frustration or dissatisfaction, which could be hazardous for Intel's reputation if not addressed properly. Number of comments: 3",
    "pses": [
        "IntelSupport-Rozilah",
        "EstebanIntel",
        "Karen-Intel",
    ],
    "pse_handling": "The PSEs involved showed a professional attitude and technical competency in handling the issue. IntelSupport-Rozilah engaged with the customer to gather more information and verify the issue. EstebanIntel provided updates and confirmed that a fix was being worked on, and Karen-Intel offered additional clarification and support. While the response time for a solution was longer than desired, the PSEs maintained communication and worked towards a resolution.",
    "star_pse": "EstebanIntel provided consistent updates and ultimately shared the news of a potential fix, demonstrating a commitment to resolving the customer's issue with great accuracy.",
    "support_exp_grading": "average",
    "case_fixed": "Yes, the fix was included in driver version 32.101.6575."
}
```