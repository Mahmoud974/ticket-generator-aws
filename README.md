

1. **Amazon S3** : Stocker les photos du ticket.
2. **AWS Lambda** : Traitement automatique des données (par exemple, extraire des informations du formulaire ou générer le ticket).
3. **Amazon API Gateway** : Créer une API pour recevoir les données du formulaire et les envoyer à Lambda.
4. **Amazon DynamoDB** : Stocker les informations du ticket dans une base de données NoSQL.
5. **Amazon SES** : Envoyer un email avec le ticket généré.

C'est une solution rapide et flexible pour automatiser tout ça.