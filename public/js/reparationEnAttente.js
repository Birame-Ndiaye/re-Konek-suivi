document.addEventListener('DOMContentLoaded', () => {
  const statuses = {
    'diagnosticTickets': 'En Cours de Diagnostic',
    'enAttenteTickets': 'En Attente Pièce',
    'propositionTickets': 'En Attente Accord'
  };

  const BACKEND_URL_Tickets = 'http://localhost:3000/tickets';

  for (const [elementId, status] of Object.entries(statuses)) {
    fetch(`${BACKEND_URL_Tickets}?status=${encodeURIComponent(status)}`)
      .then(response => response.json())
      .then(tickets => {
        console.log(`Tickets avec le statut ${status}:`, tickets);
        const ticketContainer = document.getElementById(elementId);

        // Vérifier si le conteneur existe
        if (!ticketContainer) {
          console.error(`Le conteneur avec l'ID "${elementId}" n'existe pas.`);
          return;
        }
        // Vider le conteneur
        ticketContainer.innerHTML = '';

      /*  const header = document.createElement('div');
        header.classList.add('ticket-header');
        header.innerHTML = `
          <span>Nom</span>
          <span>Appareil</span>
          <span>N° Suivi</span>
          <span>Réparation</span>
          <span>Commentaire</span>
          <span>Action</span>
        `;
        ticketContainer.appendChild(header);
*/
        // Vérifie si des tickets sont reçus
        if (!Array.isArray(tickets) || tickets.length === 0) {
          const noTicketMsg = document.createElement('p');
          noTicketMsg.textContent = 'Aucun ticket à afficher.';
          ticketContainer.appendChild(noTicketMsg);
          return;
        }

        tickets.forEach(ticket => {
          const ticketElement = document.createElement('div');
          ticketElement.classList.add('ticket');

          ticketElement.innerHTML = `
            <span>${ticket.prenom} ${ticket.nom}</span>
            <span>${ticket.letype} ${ticket.lamarque || ''} ${ticket.lemodele || ''} ${ticket.autre_appareil || ''}</span>
            <span><a href="ticketClient.html?num_suivi=${ticket.num_suivi}">${ticket.num_suivi}</a></span>
            <span>${ticket.proposition || 'N/A'}</span>
          `;

          // Ajout du champ commentaire et du bouton "Enregistrer"
          const commentaireContainer = document.createElement('div');
          commentaireContainer.classList.add('compartment');
          commentaireContainer.innerHTML = `
            <textarea id="commentaire-${ticket.num_suivi}" placeholder="Ajouter des notes">${ticket.commentaire || ''}</textarea>
            <button onclick="modifierTicket('${ticket.num_suivi}')">Enregistrer</button>
          `;
          ticketElement.appendChild(commentaireContainer);

          // Sauvegarde automatique du commentaire lors de la perte de focus
          const textarea = commentaireContainer.querySelector(`#commentaire-${ticket.num_suivi}`);
          textarea.addEventListener('blur', () => {
            modifierTicket(ticket.num_suivi);
          });

          const actionSpan = document.createElement('span');
          const button = document.createElement('button');
          button.classList.add('reprendre-btn');
          button.textContent = 'Reprendre';
          button.setAttribute('data-ticket-id', ticket.num_suivi);
          button.addEventListener('click', () => {
            reprendreReparation(ticket.num_suivi, ticketElement);
          });
          actionSpan.appendChild(button);

          ticketElement.appendChild(actionSpan);

          ticketContainer.appendChild(ticketElement);
        });
      })
      .catch(error => {
        console.error(`Erreur lors de la récupération des tickets avec le statut ${status}:`, error);
      });
  }
});

const BACKEND_URL_UpdateTicketStatus = 'http://localhost:3000/updateTicketStatus';

function reprendreReparation(ticketId, ticketElement) {
  fetch(BACKEND_URL_UpdateTicketStatus, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ticketId: ticketId,
      status: 'En Cours de Réparation',
    }),
  })
    .then(response => response.json())
    .then(data => {
      alert('Le statut du ticket a été mis à jour.');
      // Retirer le ticket de la liste actuelle
      ticketElement.parentElement.removeChild(ticketElement);
      // Optionnel : rediriger ou mettre à jour une autre liste
    })
    .catch(error => {
      console.error('Erreur lors de la mise à jour du statut du ticket:', error);
      alert('Une erreur est survenue lors de la mise à jour du statut du ticket.');
    });
}

function modifierTicket(ticketId) {
  const commentaire = document.getElementById(`commentaire-${ticketId}`).value;

  fetch('http://localhost:3000/modifierTicket', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketId: ticketId,
      commentaire: commentaire
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Réponse du serveur :', data);
      alert('Le commentaire a été modifié avec succès.');
    })
    .catch(error => {
      console.error('Erreur lors de la modification du commentaire :', error);
      alert('Une erreur est survenue lors de la modification.');
    });
}
