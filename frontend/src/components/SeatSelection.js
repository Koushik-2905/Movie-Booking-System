import React, { useState } from 'react';

const SeatSelection = ({ movie, onConfirm, onCancel, isOpen }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatCount, setSeatCount] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Generate seat layout (10 rows x 15 seats = 150 seats)
  const rows = 10;
  const seatsPerRow = 15;
  
  // Create seat data
  const generateSeats = () => {
    const seats = [];
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let seat = 1; seat <= seatsPerRow; seat++) {
        const seatId = `${row}-${seat}`;
        const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
        rowSeats.push({
          id: seatId,
          row,
          seat,
          occupied: isOccupied,
          selected: false
        });
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const [seats, setSeats] = useState(generateSeats());

  const handleSeatClick = (rowIndex, seatIndex) => {
    const seat = seats[rowIndex][seatIndex];
    
    if (seat.occupied) return; // Can't select occupied seats
    
    const newSeats = [...seats];
    const isSelected = newSeats[rowIndex][seatIndex].selected;
    const availableSeats = movie.available_seats || 0;
    
    // If clicking on a selected seat, deselect it
    if (isSelected) {
      newSeats[rowIndex][seatIndex].selected = false;
      setSelectedSeats(prev => prev.filter(s => s !== seat.id));
      setSeats(newSeats);
    } else {
      // Check if selecting this seat would exceed available seats
      const wouldExceed = selectedSeats.length >= availableSeats;
      
      if (wouldExceed) {
        // Show popup alert
        setAlertMessage(`Cannot select more than ${availableSeats} seat${availableSeats !== 1 ? 's' : ''}. Only ${availableSeats} seat${availableSeats !== 1 ? 's are' : ' is'} available for this movie.`);
        setShowAlert(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowAlert(false), 3000);
        return; // Don't select the seat
      }
      
      // Check if we've reached the selected seat count limit
      if (selectedSeats.length >= seatCount) {
        // Remove the first selected seat
        const firstSelected = selectedSeats[0];
        const [firstRow, firstSeat] = firstSelected.split('-').map(Number);
        newSeats[firstRow - 1][firstSeat - 1].selected = false;
        setSelectedSeats(prev => prev.slice(1));
      }
      
      // Select the new seat
      newSeats[rowIndex][seatIndex].selected = true;
      setSelectedSeats(prev => [...prev, seat.id]);
      setSeats(newSeats);
    }
  };

  const handleConfirm = () => {
    if (selectedSeats.length === seatCount) {
      onConfirm({
        movie_id: movie.movie_id,
        seats_selected: seatCount,
        selected_seats: selectedSeats
      });
    }
  };

  const handleSeatCountChange = (newCount) => {
    // Validate against available seats
    const maxSeats = movie.available_seats || 0;
    if (newCount > maxSeats) {
      // Show alert popup
      setAlertMessage(`Cannot select more than ${maxSeats} seat${maxSeats !== 1 ? 's' : ''}. Only ${maxSeats} seat${maxSeats !== 1 ? 's are' : ' is'} available for this movie.`);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      // Reset to max available
      setSeatCount(maxSeats);
      return;
    }
    setSeatCount(newCount);
    // Adjust selected seats if needed
    if (selectedSeats.length > newCount) {
      const newSelectedSeats = selectedSeats.slice(0, newCount);
      setSelectedSeats(newSelectedSeats);
      
      // Update seat selection state
      const newSeats = seats.map(row => 
        row.map(seat => ({
          ...seat,
          selected: newSelectedSeats.includes(seat.id)
        }))
      );
      setSeats(newSeats);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="seat-selection-modal">
      {/* Alert Popup */}
      {showAlert && (
        <div className="seat-alert-popup">
          <div className="seat-alert-content">
            <div className="seat-alert-icon">⚠️</div>
            <div className="seat-alert-message">{alertMessage}</div>
            <button className="seat-alert-close" onClick={() => setShowAlert(false)}>×</button>
          </div>
        </div>
      )}
      
      <div className="seat-selection-content">
        <div className="seat-selection-header">
          <h2>Select Seats for {movie.title}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="seat-selection-body">
          <div className="seat-count-selector">
            <label>Number of Seats:</label>
            <select 
              value={seatCount} 
              onChange={(e) => handleSeatCountChange(Number(e.target.value))}
            >
              {Array.from({ length: Math.min(movie.available_seats || 8, 8) }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            {movie.available_seats && movie.available_seats > 8 && (
              <span style={{ marginLeft: '10px', fontSize: '11px', color: '#f1a7b0' }}>
                (Max: {movie.available_seats} available)
              </span>
            )}
            <span style={{ marginLeft: '10px', fontSize: '12px', color: 'var(--muted)' }}>
              (Max: {movie.available_seats || 0} available)
            </span>
          </div>

          <div className="screen-indicator">
            <div className="screen">SCREEN</div>
          </div>

          <div className="seat-layout">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row">
                <div className="row-number">{rowIndex + 1}</div>
                {row.map((seat, seatIndex) => (
                  <button
                    key={seatIndex}
                    className={`seat ${seat.occupied ? 'occupied' : ''} ${seat.selected ? 'selected' : ''}`}
                    onClick={() => handleSeatClick(rowIndex, seatIndex)}
                    disabled={seat.occupied}
                  >
                    {seat.seat}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected</span>
            </div>
          </div>

          <div className="seat-selection-footer">
            <div className="selected-info">
              {selectedSeats.length > 0 && (
                <p>Selected Seats: {selectedSeats.join(', ')}</p>
              )}
              <p>Total Price: ₹{(movie.price * seatCount).toFixed(2)}</p>
            </div>
            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                disabled={selectedSeats.length !== seatCount}
              >
                Add to Cart ({selectedSeats.length}/{seatCount})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
