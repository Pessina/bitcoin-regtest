import { Badge } from './ui/badge';

interface ScriptTypeLabelProps {
  scriptType: string;
  className?: string;
}

export function ScriptTypeLabel({
  scriptType,
  className,
}: ScriptTypeLabelProps) {
  const getScriptTypeInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'witness_v1_taproot':
      case 'taproot':
        return { label: 'P2TR', variant: 'default' as const, title: 'Pay-to-Taproot (SegWit v1)' };
      case 'witness_v0_keyhash':
      case 'pubkeyhash':
        return scriptType.includes('witness')
          ? { label: 'P2WPKH', variant: 'secondary' as const, title: 'Pay-to-Witness-PubKey-Hash (SegWit)' }
          : { label: 'P2PKH', variant: 'outline' as const, title: 'Pay-to-PubKey-Hash (Legacy)' };
      case 'witness_v0_scripthash':
      case 'scripthash':
        return scriptType.includes('witness')
          ? { label: 'P2WSH', variant: 'secondary' as const, title: 'Pay-to-Witness-Script-Hash (SegWit)' }
          : { label: 'P2SH', variant: 'outline' as const, title: 'Pay-to-Script-Hash' };
      case 'pubkey':
        return { label: 'P2PK', variant: 'outline' as const, title: 'Pay-to-PubKey' };
      case 'multisig':
        return { label: 'Multisig', variant: 'outline' as const, title: 'Multisignature' };
      case 'nulldata':
        return { label: 'OP_RETURN', variant: 'destructive' as const, title: 'Null Data (OP_RETURN)' };
      case 'nonstandard':
        return { label: 'Non-Standard', variant: 'destructive' as const, title: 'Non-Standard Script' };
      default:
        return { label: type.toUpperCase(), variant: 'outline' as const, title: type };
    }
  };

  const info = getScriptTypeInfo(scriptType);

  return (
    <Badge variant={info.variant} className={className} title={info.title}>
      {info.label}
    </Badge>
  );
}
