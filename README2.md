![GitHub Logo](https://static1.squarespace.com/static/58ed365f20099e2bf03e0721/t/5a72265171c10bf970879fbf/1521683467932/?format=1500w)

Thank you for your interest in Allevi! We are excited to consider you for our software engineering position and want to get a chance to see who you are as a coder and how you tackle problems. We have developed this Coding Challenge as a way for you to put together a software project from the ground up yourself.

We have created a dataset which, while being computer generated data, is a good representation of the kind of data you could expect to see from customer usage of our Allevi 1 printer and resulting data from bioprinting studies. You can find the dataset in `allevi-data.json` at the root level of this repository. The dataset is an array of example prints with the following schema:

```json
  {
    "user_info": {
      "serial": { "type": "number", "description": "Serial number of the customer's BioBot 1"},
      "email": { "type": "string", "description": "Customer's email address"}
    },
    "print_info": {
      "files": {
        "input": { "type": "string", "description": "Filename of the input print GCODE file."},
        "output": { "type": "string", "description": "Filename of the post-processed print GCODE file."}
      },
      "pressure": {
        "extruder1": { "type": "number", "description": "Pressure of the first extruder at time of print."},
        "extruder2": { "type": "number", "description": "Pressure of the second extruder at the time of print."}
      },
      "crosslinking": {
        "cl_enabled": { "type": "boolean", "description": "If photocrosslinking was used during this print."},
        "cl_duration": { "type": "number", "description": "Duration of photocrosslinking using during this print in ms."},
        "cl_intensity": { "type": "number", "description": "Percent intensity of light used in photocrosslinking."},
      },
      "resolution": {
        "layerNum": { "type": "number", "description": "Number of layers in this print."},
        "layerHeight": { "type": "number", "description": "Height of each layer in mm."},
      },
      "wellplate": { "type": "number", "description": "Wellplate type used for the print."}
    },
    "print_data": {
      "livePercent": { "type": "number", "description": "Percent of final print determined to be alive through live/dead imaging."},
      "elasticity": { "type": "number", "description": "Measure of final print structural rigidity measured in kPa."},
      "deadPercent": { "type": "number", "description": "Percent of final print determined to be dead through live/dead imaging."},
    }
  }
```

Using this dataset, we would like you to build a web application using any stack you are comfortable with to build a tool for our customers and for our internal team to analyze print information and results. We'll leave the details of the application up to you and what you think would be important for the users of the application. Send us your final code on Github and we'll take a look at what you built!

Thanks and if you have any questions email us at info@allevi3d.com! We can't wait to see what you come up with!
