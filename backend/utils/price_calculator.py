def calculate_price(duration, has_trainer, is_abo, pricing_matrix):
    """
    Calculate booking price based on duration, trainer, and ABO status
    
    Args:
        duration: 30 or 60 minutes
        has_trainer: boolean
        is_abo: boolean
        pricing_matrix: dict from Settings
    
    Returns:
        float: calculated price
    """
    trainer_key = "trainer" if has_trainer else "no_trainer"
    abo_key = "abo" if is_abo else "no_abo"
    key = f"{duration}_{trainer_key}_{abo_key}"
    
    return pricing_matrix.get(key, 0.0)